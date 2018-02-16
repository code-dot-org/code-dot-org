#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'
require 'csv'

# bulk import regional partners' cohort capacity from a csv

COL_ID = 'ID'
COL_CSP = 'CSP Capacity'
COL_CSD = 'CSD Capacity'

regional_partner_csv = ARGV[0]
unless regional_partner_csv
  puts 'Usage: regional_partner_cohort_capacity regional_partner_cohort_capacity.csv'
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
  partner_id = row[COL_ID]
  puts partner_id
  csp_capacity = row[COL_CSP]
  csd_capacity = row[COL_CSD]

  begin
    RegionalPartner.find(partner_id)
  rescue ActiveRecord::RecordNotFound
    puts "Unable to find regional partner id: #{partner_id}"
    error_count += 1
    next
  end

  regional_partner_list << {id: partner_id, csp_capacity: csp_capacity, csd_capacity: csd_capacity}
end

raise "#{error_count} Errors. Not importing regional partners." if error_count > 0

# Second pass, import the data.
regional_partner_list.each do |regional_partner|
  partner = RegionalPartner.find(regional_partner[:id])
  partner.cohort_capacity_csp = regional_partner[:csp_capacity]
  partner.cohort_capacity_csd = regional_partner[:csd_capacity]
  partner.save!
end

puts "#{regional_partner_list.length} Regional Partners' Capacities Imported."
