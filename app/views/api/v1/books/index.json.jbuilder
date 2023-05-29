# frozen_string_literal: true

json.array! @books, partial: 'api/v1/books/book', as: :book
