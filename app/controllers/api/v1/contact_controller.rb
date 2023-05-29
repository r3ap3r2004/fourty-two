# frozen_string_literal: true

module Api
  module V1
    # Path: app/controllers/api/v1/contact_controller.rb
    class ContactController < ApplicationController
      skip_before_action :verify_authenticity_token

      def create
        ContactMailer.with(contact: contact_params).contact_email.deliver_later

        render json: { message: 'Contact sent successfully' }, status: :created
      end

      private

      def contact_params
        params.require(:contact).permit(:name, :email, :message)
      end
    end
  end
end
