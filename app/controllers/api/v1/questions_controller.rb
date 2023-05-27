# frozen_string_literal: true

require 'matrix'
require 'csv'
require './lib/book_parser'

module Api
  module V1
    # Path: app/controllers/questions_controller.rb
    class QuestionsController < ApplicationController
      before_action :set_question, only: %i[show resemble_callback]
      before_action :set_book
      skip_before_action :verify_authenticity_token
      skip_before_action :authenticate_user!, :only => :resemble_callback

      OPENAI_COMPLETIONS_ENDPOINT_URL = ENV.fetch('OPENAI_COMPLETIONS_ENDPOINT_URL', 'https://api.openai.com/v1/completions')
      COMPLETIONS_MODEL = ENV.fetch('COMPLETIONS_MODEL', 'text-davinci-003')
      AUTH_HEADERS = {
        'Authorization' => "Bearer #{ENV.fetch('OPENAI_API_KEY', nil)}",
        'Content-Type' => 'application/json'
      }.freeze

      # GET /questions/1 or /questions/1.json
      def show
        render json: @question, status: :ok
      end

      # POST /questions or /questions.json
      def create
        # only clean the params once, then use a local variable to access the values
        clean_params = question_params
        asked_question = (clean_params[:question] || '').strip

        return render json: { error: 'Missing question' }, status: :unprocessable_entity if asked_question.length == 0

        # make sure our question ends with a question mark
        asked_question += '?' unless asked_question[-1] == '?'

        # see if we have already asked this question or not
        @question = Question.find_by(book_id: clean_params[:book_id], question: asked_question)
        if @question
          @question.ask_count += 1
          @question.save
          return show
        end

        clean_params[:question] = asked_question
        # we didn't have an existing question, so let's create one
        @question = Question.new(clean_params)
        @question.book = Book.find(clean_params[:book_id])
        @question.ask_count = 1

        # answer = answer_question(@question)
        answer, context = answer_question(@question)

        @question.answer = answer
        @question.context = context

        return show if @question.save

        render json: @question.errors, status: :unprocessable_entity
      end

      def resemble_callback
        @question.audio_src_url = params[:url]
        @question.audio_processing = false
        @question.runtime = params[:audio_timestamps][:graph_times][-1][-1] * 1000
        @question.save
        # need to send the audio to the client
        ActionCable.server.broadcast 'questions',
                                     render_to_string({ template: 'api/v1/questions/show', formats: [:json] })

        # @ TODO: Fix this to download the file in the background once we can successfully follow resemble.ai's redirect urls
        # DownloadAudioJob.perform_async(@question.id, @question.audio_src_url)

        head :ok
      end

      def feeling_lucky
        @question = Question.where(book_id: @book.id).order('RANDOM()').first
        render json: @question, status: :ok
      end

      private

      # Use callbacks to share common setup or constraints between actions.
      def set_question
        @question = Question.find(params[:id])
      end

      def set_book
        @book = Book.find(params[:book_id]) if params[:book_id]
      end

      # Only allow a list of trusted parameters through.
      def question_params
        params.require(:question).permit(:book_id, :ask_count, :audio_src_url, :question, :answer, :context)
      end

      def answer_question(question)
        # Find the appropriate book sections
        # prompt = generate_prompt(question, question.book)
        prompt, context = generate_prompt(question, question.book)
        Rails.logger.debug { "prompt: #{prompt}" }
        Rails.logger.debug { "context: #{context}" }

        # Call the openai completions API
        response = HTTParty.post(
          OPENAI_COMPLETIONS_ENDPOINT_URL,
          headers: AUTH_HEADERS,
          body: {
            model: COMPLETIONS_MODEL,
            prompt:,
            temperature: 0.0,
            max_tokens: 150,
            n: 1

          }.to_json
        )

        answer = ''

        if response.success?
          response_json = JSON.parse(response.body)
          Rails.logger.debug { "response_json: #{response_json}" }
          answer = response_json['choices'][0]['text']
        end

        [answer, context]
      end

      def order_book_sections_by_similarity(query_embeddings, book)
        # Load the embeddings for the book
        embeddings = []
        csv_string = book.embeddings_file.download
        CSV.parse(csv_string, headers: true) do |row|
          embeddings << { title: row['title'], tokens: row['tokens'], content: row['content'],
                          similarity: vector_similarity(query_embeddings, row['embeddings'].split('|').map(&:to_f)) }
        end
        # sort the embeddings by similarity, reverse the order so the most similar is first
        embeddings.sort_by { |section| section[:similarity] }.reverse
      end

      def vector_similarity(x, y)
        # Calculate the similarity between two vectors
        # use the dot product of the two vectors
        a = Vector.send(:new, x)
        b = Vector.send(:new, y)
        a.inner_product(b)
      end

      def generate_query_embeddings(question)
        # call the openai embeddings api
        BookParser.call_openai_embeddings_api(question.question)
      end

      def generate_prompt(question, book)
        max_section_data_len = 500 # most pages have more than 500 words, so we will increase this to 1500 to allow about 2.5 pages per query
        separator = "\n* "
        separator_len = 3

        query_embeddings, _tokens_used = generate_query_embeddings(question)
        ordered_sections = order_book_sections_by_similarity(query_embeddings, book)
        # create the prompt
        chosen_sections = []
        chosen_sections_len = 0
        ordered_sections.each_with_index do |section, _index|
          chosen_sections << "#{separator}#{section[:content]}"
          chosen_sections_len += section[:tokens].to_i + separator_len
          break if chosen_sections_len > max_section_data_len
        end

        # we aren't going to worry about exceeding the max_section_data_len by more than a page

        context = chosen_sections.join
        [
          "#{book.hint}#{separator}#{context}\n\nPlease keep your answers to three sentences maximum, and speak in complete sentences. Stop speaking once your point is made. Base your response on the context provided above.\n\nQ:#{question.question}\nA:\n", context
        ]
      end
    end
  end
end
