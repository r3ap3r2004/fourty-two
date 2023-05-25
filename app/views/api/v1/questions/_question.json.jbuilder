json.extract! question, :id, :book_id, :ask_count, :audio_src_url, :question, :answer, :context, :created_at,
              :updated_at
json.url api_v1_book_question_url(question, format: :json)

json.model_type :question
