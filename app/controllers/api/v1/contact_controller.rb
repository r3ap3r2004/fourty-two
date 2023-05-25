# frozen_string_literal: true

module Api
  module V1
    # Path: app/controllers/api/v1/contact_controller.rb
    class ContactController < ApplicationController
      skip_before_action :verify_authenticity_token

      def create
        clean_params = {
          name: ActionController::Base.helpers.sanitize(params[:contact][:name]),
          email: ActionController::Base.helpers.sanitize(params[:contact][:email]),
          message: ActionController::Base.helpers.sanitize(params[:contact][:message])
        }
        # need to send an email to the admin with the contact_params
        ContactMailer.with(contact: clean_params).contact_email.deliver_later

        render json: { message: 'Contact sent successfully' }, status: :created
      end
    end
  end
end
