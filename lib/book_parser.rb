# frozen_string_literal: true

require 'pdf-reader'
require 'csv'
require 'tiktoken_ruby'

# create a custom error class for openai api errors
class OpenAIError < StandardError; end

# create a class that will take in a pdf file and output a csv file
# the csv file will have the following columns:
#   - title: the title of the book
#   - tokens: the number of tokens used to generate the embeddings
#   - content: the text content of the page
#   - embeddings: the embeddings generated for the page
class BookParser
  # Set the rate limits
  REQUESTS_PER_MINUTE = ENV.fetch('REQUESTS_PER_MINUTE', 60)
  TOKENS_PER_MINUTE = ENV.fetch('TOKENS_PER_MINUTE', 150_000)
  MODEL = ENV.fetch('MODEL', 'text-embedding-ada-002')

  ENDPOINT_URL = 'https://api.openai.com/v1/embeddings'
  AUTH_HEADERS = {
    'Authorization' => "Bearer #{ENV.fetch('OPENAI_API_KEY')}",
    'Content-Type' => 'application/json'
  }.freeze

  # I am intentionally not breaking this out into multiple methods to
  # reduce the number of function calls in the loops and prevent
  # unecessary pushing/popping of variables to/from the stack.  This also allows for
  # directly inserting the results into the CSV file without needing intermediate storage.
  def self.parse_book(input_filepath, output_filepath)
    Rails.logger.debug { "Input filepath: #{input_filepath}" }
    Rails.logger.debug { "Output filepath: #{output_filepath}" }
    Rails.logger.debug { "REQUESTS_PER_MINUTE: #{REQUESTS_PER_MINUTE}" }
    Rails.logger.debug { "TOKENS_PER_MINUTE: #{TOKENS_PER_MINUTE}" }
    Rails.logger.debug { "MODEL: #{MODEL}" }

    # 1. open the pdf file
    pdf_file = File.open(input_filepath, 'rb')

    # 2. read the pdf file
    pdf_reader = PDF::Reader.new(pdf_file)

    # Initialize the token count and the time since the last minute
    token_count = 0
    last_minute = Time.now.to_i
    request_count = 0

    encoding = Tiktoken.encoding_for_model(MODEL)

    # Open the CSV file and write the headers
    CSV.open(output_filepath, 'w') do |csv|
      csv << %w[title tokens content embeddings]

      # Loop through the PDF pages and write to the CSV file
      begin
        pdf_reader.pages.each_with_index do |page, i|
          # Extract the text from the page
          page_text = page.text

          # strip www.freeclassicebooks.com <page number> from the beginning of content
          page_text = page_text.gsub(/www.freeclassicebooks.com \d+/, '')

          Rails.logger.debug { "Page #{i + 1}: #{page_text}" }

          # use the tiktoken gem to get the estimated tokens used for the current page
          t_count = encoding.encode(page_text).length

          Rails.logger.debug { "Tokens to submit: #{t_count}" }
          Rails.logger.debug { "Available tokens: #{TOKENS_PER_MINUTE - token_count}" }

          # Check if we've exceeded the token limit for the current minute
          current_time = Time.now.to_i
          Rails.logger.debug { "Current time: #{current_time}" }
          Rails.logger.debug { "Last minute: #{last_minute}" }
          Rails.logger.debug { "Elapsed time: #{current_time - last_minute}" }
          Rails.logger.debug { "Request count for this period: #{request_count}" }
          Rails.logger.debug { "Token count for this period: #{token_count + t_count}" }

          if (current_time - last_minute < 60) &&
             ((token_count + t_count > TOKENS_PER_MINUTE) || request_count >= REQUESTS_PER_MINUTE)
            # Wait for the remainder of the minute
            Rails.logger.debug { "Waiting for #{60 - (current_time - last_minute)} seconds" }
            sleep(60 - (current_time - last_minute))
            # Reset the token count and the last minute
            token_count = 0
            last_minute = Time.now.to_i
            request_count = 0
          elsif current_time - last_minute >= 60
            # Reset the token count and the last minute
            token_count = 0
            last_minute = current_time
            request_count = 0
          end

          # Generate the embeddings for the current page using the OpenAI API
          page_embeddings, tokens_used = call_openai_embeddings_api(page_text)

          # Add the tokens used to the token count
          token_count += tokens_used
          request_count += 1

          Rails.logger.debug { "Tokens used: #{tokens_used}" }
          # Rails.logger.debug("Embeddings: #{page_embeddings}")

          # Write the page number and text to the CSV file
          csv << ["Page #{i + 1}", tokens_used, page_text, page_embeddings.join('|')]
        end
      rescue StandardError => e
        Rails.logger.error("Error: #{e.message}")
        pdf_file.close
        # If an exception was thrown, re-raise the exception
        raise e
      end
    end
    Rails.logger.debug('Finished parsing book. Closing pdf file.')
    pdf_file.close
  end

  # Method to call the OpenAI embeddings endpoint with a single input string
  def self.call_openai_embeddings_api(input_string)
    response = HTTParty.post(
      ENDPOINT_URL,
      headers: AUTH_HEADERS,
      body: {
        input: input_string,
        model: MODEL
      }.to_json
    )

    if response.success?
      response_json = JSON.parse(response.body)
      embeddings = response_json['data'][0]['embedding']
      tokens_used = response_json['usage']['total_tokens']
      return embeddings, tokens_used
    end

    raise OpenAIError, "OpenAI embeddings API call failed with status code #{response.code}: #{response.body}"
  end
end
