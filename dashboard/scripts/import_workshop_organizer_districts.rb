#!/usr/bin/env ruby
require_relative '../config/environment'
require 'csv'

COL_EMAIL = 'Email'.freeze
COL_USER_ID = 'Code Studio ID'.freeze

district_csv = ARGV[0]
unless district_csv
  puts 'Usage: import_workshop_organizer_districts districts.csv'
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
district_list = []
error_count = 0
CSV.foreach(district_csv, headers: true) do |row|
  email = row[COL_EMAIL]
  user_id = row[COL_USER_ID]

  next unless email || user_id

  # Some districts don't have accounts yet and are marked with - followed by a comment in the id field.
  next if user_id && user_id.start_with?('-')
  district_contact = begin
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

  district_list << {contact: district_contact}
end

raise "#{error_count} Errors. Not importing districts." if error_count > 0

# # Second pass, import the data.
district_list.each do |district|
  user = district[:contact]
  user.permission = UserPermission::WORKSHOP_ORGANIZER
  user.save!

  #TODO: Create the district with this user as the contact (after facilitator summit)
end

puts "#{district_list.length} Districts Imported."
