# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Contacts' do
  describe 'GET /index' do
    let :email_params do
      {
        contact: {
          email: 'test@example.com',
          name: 'Test User',
          message: 'This is a test message.'

        }
      }
    end
    let :message_delivery do
      instance_double(ActionMailer::MessageDelivery)
    end

    it 'sends an email' do
      sign_in(User.create!(email: 'test@example.com', password: 'password', password_confirmation: 'password',
                           confirmed_at: Time.current))
      expect do
        post api_v1_contact_url, params: email_params, as: :json
      end.to have_enqueued_mail(ContactMailer, :contact_email)
    end
  end
end
