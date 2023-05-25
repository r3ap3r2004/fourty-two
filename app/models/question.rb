# frozen_string_literal: true

require 'resemble'

Resemble.api_key = ENV.fetch('RESEMBLE_API_KEY', nil)

# Path: app/models/question.rb
class Question < ApplicationRecord
  belongs_to :book
  has_one_attached :mp3

  after_create_commit :generate_audio
  after_destroy :delete_audio

  validates :question, presence: true

  def generate_audio
    GenerateAudioJob.new.perform(id)
  end

  def delete_audio
    return unless audio_id

    project_uuid = ENV.fetch('RESEMBLE_PROJECT_UUID', nil)
    Resemble::V2::Clip.delete(project_uuid, audio_id)
  end
end
