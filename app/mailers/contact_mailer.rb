# frozen_string_literal: true

# Path: app/mailers/contact_mailer.rb
class ContactMailer < ApplicationMailer
  def contact_email
    @contact = params[:contact]

    mail(to: ENV.fetch('ADMIN_EMAIL'), from: ENV.fetch('OUTBOUND_EMAIL'),
         subject: "[Ask A Book] Contact from #{@contact[:name]}")
  end
end
