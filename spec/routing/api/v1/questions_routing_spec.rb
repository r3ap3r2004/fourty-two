# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::QuestionsController do
  describe 'routing' do
    it 'routes to #create' do
      expect(post: 'api/v1/books/1/questions').to route_to('api/v1/questions#create', book_id: '1')
    end
  end
end
