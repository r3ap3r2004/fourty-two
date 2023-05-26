require 'rails_helper'

RSpec.describe Book, type: :model do
  let! :pdf_file do
    fixture_file_upload('pdf/adventures_of_huckleberry_finn.pdf', 'application/pdf')
  end
  # This should return the minimal set of attributes required to create a valid
  # Book. As you add validations to Book, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) do
    {
      title: 'Adventures of Huckleberry Finn',
      author: 'Mark Twain',
      summary: 'A nice book about a couple of kids.'
    }
  end

  let(:invalid_attributes) do
    {
      title: '',
      author: 'Mark Twain',
      summary: 'A nice book about a couple of kids.'
    }
  end

  describe 'check for openAI calling' do
    before do
      stub_request(:post, 'https://api.openai.com/v1/embeddings')
        .to_return(status: 200,
                   body: file_fixture('openAI/responses/embeddings/adventures_of_huckleberry_finn_page_embeddings.json'),
                   headers: {})
    end

    context 'with valid parameters' do
      it 'creates a new Book' do
        Sidekiq::Testing.inline! do
          expect do
            Rails.logger.debug { "valid_attributes: #{valid_attributes}" }
            book = described_class.new(valid_attributes)
            blob = ActiveStorage::Blob.create_and_upload!(
              io: pdf_file,
              filename: 'huck.pdf',
              content_type: 'application/pdf'
            )
            book.pdf.attach(blob)
            book.save!
          end.to change(Book, :count).by(1)
        end
      end
    end

    context 'with invalid parameters' do
      it 'does not create a new Book' do
        Sidekiq::Testing.inline! do
          expect do
            Book.create(invalid_attributes)
          end.not_to change(Book, :count)
        end
      end
    end
  end
end
