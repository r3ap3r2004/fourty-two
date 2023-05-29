# frozen_string_literal: true

require 'open-uri'

# Job to handle downloading of audio from resemble.ai to local storage
class DownloadAudioJob
  include Sidekiq::Job

  def perform(id, url)
    question = Question.find(id)
    downloaded_mp3 = URI.parse(url).open(&:read)

    # attach the mp3 file to the question
    question.mp3.attach(io: downloaded_mp3, filename: "question_#{question.id}")

    return unless question.save!
    raise "failed to attach the mp3 file #{url}" unless question.mp3.attached?

    # delete the resemble audio file to keep that system clean
    question.delete_audio
  end
end
