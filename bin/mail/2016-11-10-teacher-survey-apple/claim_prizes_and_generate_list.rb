#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require_relative '../../../pegasus/helpers/prize_helpers'
require 'active_support'
require 'active_support/core_ext/object/blank'
require 'set'

# Reads responses from an exported form_responses.csv (not checked into the repo because it contains PII)
# For responses that requested a prize, claim a prize and prepare to send email with that prize code.

# 1617 suffix for the 2016/2017 school year
PRIZE_PURPOSE = 'TeacherImplementation1617'.freeze
PRIZE_TYPE = 'Apple.US'.freeze

COL_RECEIVE_PRIZE = 'Would you like to receive a $10 Apple gift card for completing this survey? If so, you will receive a follow up email by November 20th with instructions about how to claim your gift.'.freeze
COL_EMAIL = 'Please provide your email address to receive your gift card.'.freeze

emails = Set.new

CSV.open('claimed-prizes.csv', 'w') do |csv|
  csv << [:email, :prize_code_s]
  CSV.foreach('./form_responses.csv', headers: true) do |row|
    next unless row[COL_RECEIVE_PRIZE] && row[COL_EMAIL]
    next unless row[COL_RECEIVE_PRIZE].strip.downcase == 'yes'
    email = row[COL_EMAIL].strip.downcase
    next if email.blank? || emails.include?(email)
    emails.add email

    # Note claim_prize_code is idempotent.
    # If this is called again with the same parameters, it will return the already claimed prize code.
    prize_code = claim_prize_code PRIZE_TYPE, email, PRIZE_PURPOSE
    csv << [email, prize_code]
  end
end
