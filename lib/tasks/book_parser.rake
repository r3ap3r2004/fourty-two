# frozen_string_literal: true

require './lib/book_parser'

# Be able to parse a pdf book from the command line
namespace :book_parser do
  desc 'Parse book'
  task :parse_book, %i[pdf csv] => :environment do |_t, args|
    Rails.logger = Logger.new($stdout)
    if args[:pdf].nil? || args[:csv].nil?
      puts 'Usage: rake book_parser:parse_book[<pdf>,<csv>]'
      exit
    end
    puts "Parsing book #{args[:pdf]} to #{args[:csv]}"
    BookParser.parse_book args[:pdf], args[:csv]
  end
end
