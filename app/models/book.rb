# frozen_string_literal: true

# Path: app/models/book.rb
class Book < ApplicationRecord
  has_one_attached :pdf
  has_one_attached :embeddings_file
  has_one_attached :cover do |image|
    image.variant :thumb, resize_to_limit: [200, 200]
  end

  validates :title, presence: true
  validates :author, presence: true

  after_create_commit :generate_embeddings

  def generate_embeddings
    GenerateEmbeddingsJob.perform_async(id)
  end
end
