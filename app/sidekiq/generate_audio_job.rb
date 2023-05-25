# frozen_string_literal: true

require 'resemble'

Resemble.api_key = ENV.fetch('RESEMBLE_API_KEY', nil)

# Generate embeddings for a book
class GenerateAudioJob
  include Sidekiq::Job
  include Rails.application.routes.url_helpers

  def perform(question_id)
    question = Question.find(question_id)

    project_uuid = ENV.fetch('RESEMBLE_PROJECT_UUID', nil)
    voice_uuid = ENV.fetch('RESEMBLE_VOICE_UUID', nil)
    callback_uri = resemble_callback_api_v1_question_url(question, host: ENV.fetch('CALLBACK_HOST', 'http://localhost:3000'))
    Rails.logger.debug { "callback_uri: #{callback_uri}" }

    response = Resemble::V2::Clip.create_async(
      project_uuid,
      voice_uuid,
      callback_uri,
      question.answer,
      title: nil,
      sample_rate: 44_100,
      output_format: 'mp3',
      precision: nil,
      include_timestamps: nil,
      is_public: nil,
      is_archived: nil
    )
    Rails.logger.debug { "RESEMBLE true response:START:#{response.to_json}:END:" }

    clip = response['item']

    question.audio_id = clip['uuid']
    question.save!
  end
end
