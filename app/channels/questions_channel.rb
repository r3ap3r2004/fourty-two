# Broadcasts questions to the user
class QuestionsChannel < ApplicationCable::Channel
  def subscribed
    stream_from :questions
  end
end
