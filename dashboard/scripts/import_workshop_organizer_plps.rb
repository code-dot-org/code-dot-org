#!/usr/bin/env ruby
require_relative '../config/environment'
require 'csv'

COL_PLP_NAME = 'PLP Name'
COL_EMAIL = 'PM Email'
COL_USER_ID = 'Code Studio ID'
COL_URBAN = 'Urban'

plp_csv = ARGV[0]
unless plp_csv
  puts 'Usage: import_workshop_organizer_plps workshop_organizer_plps.csv'
  exit
end

class CSV::Row
  def [](header)
    raw_value = self.field header
    return nil unless raw_value
    raw_value.strip
  end
end

# First pass, validate the data.
plp_list = []
error_count = 0
CSV.foreach(plp_csv, headers: true) do |row|
  plp_name = row[COL_PLP_NAME]
  email = row[COL_EMAIL]
  user_id = row[COL_USER_ID]
  urban = (row[COL_URBAN].try(:downcase) == 'yes')

  next unless email || user_id

  # Some PLPs don't have accounts yet and are marked with - followed by a comment in the id field.
  next if user_id && user_id.start_with?('-')
  plp = begin
    if user_id.nil?
      User.find_by!(email: email)
    else
      User.find_by!(id: user_id)
    end
  rescue ActiveRecord::RecordNotFound
    puts "Unable to find user id: #{user_id} or email: #{email}"
    error_count += 1
    next
  end

  plp_list << {plp: plp, plp_name: plp_name, urban: urban}
end

raise "#{error_count} Errors. Not importing plps." if error_count > 0

# Second pass, import the data.
plp_list.each do |plp|
  user = plp[:plp]
  user.permission = UserPermission::WORKSHOP_ORGANIZER
  user.save!

  ProfessionalLearningPartner.create!(contact_id: user.id, name: plp[:plp_name], urban: plp[:urban])
end

puts "#{plp_list.length} Professional Learning Partners Imported."
