#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require_relative '../../../pegasus/helpers/prize_helpers'
require 'active_support'
require 'active_support/core_ext/object/blank'
require 'set'

# Read responses from an exported impact_study_teachers.csv (not checked into the repo because it contains PII)
# Claim a prize for each row and prepare to send email with that prize code.
INPUT_CSV = 'impact_study_teachers.csv'.freeze
RESULT_CSV = 'claimed_prizes.csv'.freeze

PRIZE_PURPOSE = 'Hoc2016ImpactStudy'.freeze
PRIZE_TYPE = 'Apple.US'.freeze

COL_EMAIL = 'email'.freeze

# The source csv has a raw "name" column, and a sanitized "new name" which is what we want
COL_NAME = 'new name'.freeze

emails = Set.new

CSV.open(RESULT_CSV, 'w') do |csv|
  csv << [:email, :name_s, :prize_code_s]
  CSV.foreach(INPUT_CSV, headers: true) do |row|
    email = row[COL_EMAIL]
    name = row[COL_NAME]
    next if email.blank? || emails.include?(email)
    emails.add email

    # Note claim_prize_code is idempotent.
    # If this is called again with the same parameters, it will return the already claimed prize code.
    prize_code = claim_prize_code PRIZE_TYPE, email, PRIZE_PURPOSE
    csv << [email, name, prize_code]
  end
end
