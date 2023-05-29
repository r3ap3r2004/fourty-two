# frozen_string_literal: true

# This code disables user registration if the ALLOW_REGISTRATION environment variable is set to false.
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable, :registerable,
  if ENV.fetch('ALLOW_REGISTRATION', 'false') == 'true'
    Rails.logger.debug { 'User registration is enabled' }
    devise :database_authenticatable, :recoverable, :rememberable, :validatable, :registerable, :confirmable
  else
    Rails.logger.debug { 'User registration is disabled' }
    devise :database_authenticatable, :recoverable, :rememberable, :validatable
  end
end
