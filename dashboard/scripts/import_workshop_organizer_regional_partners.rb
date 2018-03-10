#!/usr/bin/env ruby
require_relative '../config/environment'
require 'csv'

COL_NAME = 'PLP Name'.freeze
COL_EMAIL = 'PM Email'.freeze
COL_USER_ID = 'Code Studio ID'.freeze
COL_URBAN = 'Urban'.freeze

regional_partner_csv = ARGV[0]
unless regional_partner_csv
  puts 'Usage: import_workshop_organizer_regional_partners workshop_organizer_regional_partners.csv'
  exit
end

class CSV::Row
  def [](header)
    raw_value = field header
    return nil unless raw_value
    raw_value.strip
  end
end

# First pass, validate the data.
regional_partner_list = []
error_count = 0
CSV.foreach(regional_partner_csv, headers: true) do |row|
  name = row[COL_NAME]
  email = row[COL_EMAIL]
  user_id = row[COL_USER_ID]
  urban = (row[COL_URBAN].try(:downcase) == 'yes')

  next unless email || user_id

  # Some partnerss don't have accounts yet and are marked with - followed by a comment in the id field.
  next if user_id && user_id.start_with?('-')
  regional_partner = begin
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

  regional_partner_list << {regional_partner: regional_partner, name: name, urban: urban}
end

raise "#{error_count} Errors. Not importing regional partners." if error_count > 0

# Second pass, import the data.
regional_partner_list.each do |regional_partner|
  user = regional_partner[:regional_partner]
  user.permission = UserPermission::WORKSHOP_ORGANIZER
  user.save!

  partner = RegionalPartner.find_or_create_by!(name: regional_partner[:name])
  partner.contact_id = user.id
  partner.urban = regional_partner[:urban]
  partner.save!
end

puts "#{regional_partner_list.length} Regional Partners Imported."
