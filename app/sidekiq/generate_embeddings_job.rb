# frozen_string_literal: true

# require the book_parser file
require './lib/book_parser'

# Generate embeddings for a book
class GenerateEmbeddingsJob
  include Sidekiq::Job

  def perform(book_id)
    book = Book.find(book_id)
    book.pdf.open do |pdf_file|
      # create a temporary file to store the embeddings
      Tempfile.create do |tempfile|
        BookParser.parse_book(pdf_file.path, tempfile.path)
        # Create an Active Storage blob from the temporary file
        blob = ActiveStorage::Blob.create_and_upload!(
          io: tempfile,
          filename: "#{book.title.downcase.parameterize}_embeddings.csv",
          content_type: 'text/csv'
        )
        book.embeddings_file.attach(blob)
        book.update(processing: false)
      end
    end
    book.update(processing: false)
    book.reload
    renderer = ActionController::Renderer.new(Api::V1::BooksController,
                                              { 'HTTP_HOST' => ENV.fetch('HOST', 'localhost:3000') }, {})
    output = renderer.render_to_string({ template: 'api/v1/books/_book', layout: false,
                                         formats: [:json], locals: { book: } })

    ActionCable.server.broadcast 'books', output
  end
end
