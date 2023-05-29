# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Question do
  let(:book) do
    b = Book.new(
      title: 'Adventures of Huckleberry Finn',
      author: 'Mark Twain',
      summary: 'A nice book about a couple of kids.',
      id: 1
    )
    b.pdf.attach(
      io: Rails.root.join('spec/fixtures/files/pdf/adventures_of_huckleberry_finn.pdf').open,
      filename: 'huck_finn.pdf',
      content_type: 'application/pdf'
    )
    b.embeddings_file.attach(
      io: Rails.root.join('spec/fixtures/files/csv/adventures_of_huckleberry_finn.csv').open,
      filename: 'huck_finn_embeddings.csv',
      content_type: 'text/csv'
    )
    b.save
    b
  end

  let(:valid_attributes) do
    {
      book_id: book.id,
      question: 'Who is the author?',
      answer: 'The author is Mark Twain.',
      context: 'Some context'
    }
  end

  let(:invalid_attributes) do
    {
      book_id: book.id
    }
  end

  describe 'question validations work properly' do
    before do
      stub_request(:post, 'https://api.openai.com/v1/embeddings')
        .to_return(status: 200, body: file_fixture('openAI/responses/embeddings/who_is_the_author.json'), headers: {})
      stub_request(:post, 'https://api.openai.com/v1/completions')
        .to_return(status: 200, body: file_fixture('openAI/responses/completions/who_is_the_author.json'), headers: {})

      allow(Resemble::V2::Clip).to receive(:create_async)
        .and_return(JSON.parse(file_fixture('resemble/responses/who_is_the_author.json').read))
    end

    context 'with valid parameters' do
      it 'creates a new Question' do
        expect do
          described_class.create(valid_attributes)
        end.to change(described_class, :count).by(1)
      end
    end

    context 'with invalid parameters' do
      it 'does not create a new Question' do
        expect do
          described_class.create(invalid_attributes)
        end.not_to change(described_class, :count)
      end
    end
  end
end
