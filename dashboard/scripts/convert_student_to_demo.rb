#!/usr/bin/env ruby
# frozen_string_literal: true

# Usage: bin/rails runner scripts/convert_student_to_demo.rb <user_id1> <user_id2> ...
#
# Converts students to demo accounts by removing their ability to log in.
# Only operates on students with email, secret word, or secret picture login types.

require_relative '../config/environment'

ALLOWED_LOGIN_TYPES = [
  Section::LOGIN_TYPE_EMAIL,
  Section::LOGIN_TYPE_WORD,
  Section::LOGIN_TYPE_PICTURE,
].freeze

user_ids = ARGV.map(&:to_i)

if user_ids.empty?
  puts 'Usage: bin/rails runner scripts/convert_student_to_demo.rb <user_id1> <user_id2> ...'
  exit 1
end

user_ids.each do |user_id|
  user = User.find_by(id: user_id)

  unless user
    puts "User #{user_id}: not found, skipping"
    next
  end

  unless user.student?
    puts "User #{user_id}: not a student, skipping"
    next
  end

  section_login_types = user.sections_as_student.pluck(:login_type).uniq
  unless section_login_types.any? {|lt| ALLOWED_LOGIN_TYPES.include?(lt)}
    puts "User #{user_id}: not in an email/word/picture section, skipping"
    next
  end

  user.update!(
    secret_words: nil,
    secret_picture_id: nil,
    encrypted_password: '',
    hashed_email: '',
  )
  user.authentication_options.destroy_all

  puts "User #{user_id}: converted to demo account"
end
