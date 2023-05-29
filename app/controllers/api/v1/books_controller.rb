# frozen_string_literal: true

# Controller to return all books and a single book
module Api
  module V1
    # Path: app/controllers/api/v1/books_controller.rb
    class BooksController < ApplicationController
      before_action :set_book, only: %i[show update destroy]
      skip_before_action :verify_authenticity_token

      # GET /books or /books.json
      def index
        @books = Book.order(created_at: :desc).all
      end

      # GET /books/1 or /books/1.json
      def show; end

      # POST /books or /books.json
      def create
        @book = Book.new(book_params)

        # Rails.logger.debug { "book_params: #{book_params}" }
        return render json: { error: 'Missing PDF' }, status: :unprocessable_entity unless params[:book][:pdf]

        if @book.save
          render :show, status: :created
        else
          render json: @book.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /books/1 or /books/1.json
      def update
        if @book.update(book_params)
          render :show, status: :ok
        else
          render json: @book.errors, status: :unprocessable_entity
        end
      end

      # DELETE /books/1 or /books/1.json
      def destroy
        @book.destroy

        head :no_content
      end

      private

      # Use callbacks to share common setup or constraints between actions.
      def set_book
        @book = Book.find(params[:id])
      end

      # Only allow a list of trusted parameters through.
      def book_params
        params.require(:book).permit(:title, :author, :pdf, :cover, :hint, :summary)
      end
    end
  end
end
