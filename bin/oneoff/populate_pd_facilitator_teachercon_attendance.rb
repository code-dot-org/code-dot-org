#!/usr/bin/env ruby

# This script populates the Pd::FacilitatorTeacherconAttendance table with dates
# generated from the facilitator registration gsheet

require 'csv'
require_relative '../../dashboard/config/environment'

FILENAME = ARGV[0].freeze

DATE_FIELDS = [
  :tc1_arrive,
  :tc1_depart,
  :fit1_arrive,
  :fit1_depart,
  :tc2_arrive,
  :tc2_depart,
  :fit2_arrive,
  :fit2_depart,
  :tc3_arrive,
  :tc3_depart,
  :fit3_arrive,
  :fit3_depart,
].freeze

CSV.table(FILENAME).each do |line|
  data = line.to_h

  data[:user] = User.find_by!(email: data[:email])
  data.delete :email

  DATE_FIELDS.each do |field|
    data[field] = Date.strptime(data[field], "%m/%d/%Y") unless data[field].nil?
  end

  Pd::FacilitatorTeacherconAttendance.create!(data)
end
