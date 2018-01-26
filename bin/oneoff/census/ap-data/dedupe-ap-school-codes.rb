#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'street_address'

class CodeMatch
  attr_accessor :ap_name
  attr_reader :matches

  def add_match(school_id, school_name)
    @matches.push({school_id: school_id, school_name: school_name})
  end

  def initialize(name)
    @ap_name = name
    @matches = []
  end
end

ap_code_matches = {}
CSV.foreach('ap-school-code-map.csv', {headers: true}) do |row|
  school_code = row['ap_school_code']
  ap_name = row['ap_school_name']
  school_id = row['nces_school_id']
  nces_name = row['nces_school_name']

  existing_match = ap_code_matches[school_code]
  if existing_match
    existing_match.add_match(school_id, nces_name)
  else
    match = CodeMatch.new(ap_name)
    match.add_match(school_id, nces_name)
    ap_code_matches[school_code] = match
  end
end

CSV.open('ap-school-code-map-deduped.csv', 'w') do |csv|
  csv << %w(ap_school_code ap_school_name nces_school_id nces_school_name)

  ap_code_matches.each do |school_code, match_set|
    if match_set.matches.length > 1
      puts "Which of these best matches \"#{match_set.ap_name}\"?"
      match_set.matches.each_with_index do |match, index|
        puts "#{index}: \"#{match[:school_name]}\""
      end
      puts "x: None of the above"
      print "Choice: "
      selection = gets.chomp
      next if selection == "x"
      i = selection.to_i
      school_id = match_set.matches[i][:school_id]
      school_name = match_set.matches[i][:school_name]
    else
      school_id = match_set.matches.first[:school_id]
      school_name = match_set.matches.first[:school_name]
    end

    csv << [school_code, match_set.ap_name, school_id, school_name]
  end
end
