# frozen_string_literal: true

# Be able to parse a pdf book from the command line
namespace :users do
  desc 'Create a user'
  task :create_user, %i[email password] => :environment do |_t, args|
    Rails.logger = Logger.new($stdout)
    if args[:email].nil? || args[:password].nil?
      puts 'Usage: rake users:create_user[<email>,<password>]'
      exit
    end
    puts "Creating user #{args[:email]}"
    User.create!(email: args[:email], password: args[:password], password_confirmation: args[:password])
  end
end
