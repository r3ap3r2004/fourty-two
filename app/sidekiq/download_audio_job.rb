# frozen_string_literal: true

require 'open-uri'

class DownloadAudioJob
  include Sidekiq::Job

  def perform(id, url)
    question = Question.find(id)

    # use the URI.parse to prevent malicious urls being passed to open
    # for example open("| ls") or worse
    downloaded_mp3 = URI.parse(url).open { |f| f.read }

    # attach the mp3 file to the question
    question.mp3.attach(io: downloaded_mp3, filename: "question_#{question.id}")

    return unless question.save!
    raise "failed to attach the mp3 file #{url}" unless question.mp3.attached?

    # delete the resemble audio file to keep that system clean
    question.delete_audio
  end
end
