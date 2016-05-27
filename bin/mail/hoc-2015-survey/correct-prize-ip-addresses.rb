#!/usr/bin/env ruby
require_relative '../../../pegasus/src/env'
require src_dir 'database'
require 'json'

puts "Updating hoc_survey_prize claimed_ip fields from 'expression' to the ips from their associated prize selection forms..."
count = 0
DB[:forms].where(kind: 'HocSurveyPrize2015').exclude(processed_at: nil).exclude(processed_at: 0).each do |form|
  data = JSON.load form[:data]
  processed_data = JSON.load form[:processed_data]

  prize = DB[:hoc_survey_prizes].where(claimant: form[:email], type: data['prize_choice_s'], value: processed_data['prize_code_s'], claimed_ip: 'expression').first
  if prize
    DB[:hoc_survey_prizes].where(id: prize[:id]).update(claimed_ip: form[:created_ip])
    count += 1
  end
end

puts "#{count} rows updated."
