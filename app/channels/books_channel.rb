# frozen_string_literal: true

# Broadcasts books to the user
class BooksChannel < ApplicationCable::Channel
  def subscribed
    stream_from :books
  end
end
