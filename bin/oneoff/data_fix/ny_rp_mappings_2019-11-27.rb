#!/usr/bin/env ruby

# Replaces the regional partner mappings for our two New York regional partners with
# new data provided in CSV format, as of November 2019.

start_time = Time.now
puts "Loading environment..."
require_relative '../../../dashboard/config/environment'

WNY_STEM_HUB_ID = 71
MOUSE_ID = 28
REGIONAL_PARTNER_IDS = [WNY_STEM_HUB_ID, MOUSE_ID]

# We're going to build up this map from partner IDs to zipcode sets while reading the CSV.
# Using sets because the CSV contains duplicate entries.
ZIPS_BY_PARTNER = {
  WNY_STEM_HUB_ID => Set.new,
  MOUSE_ID => Set.new
}

puts "Reading CSV..."
row_count = 0
CSV.foreach(deploy_dir('bin/oneoff/data_fix/ny_rp_mappings_2019-11-27.csv'), headers: true) do |row|
  row_count += 1

  # Rows are in the form [ "Partner", "Partner ID", "ZIP Code" ]
  partner_id = row['Partner ID'].to_i
  # Zipcodes in the CSV may be missing leading zeros, and must be leftpadded
  zip_code = row['ZIP Code'].rjust(5, '0')

  ZIPS_BY_PARTNER[partner_id] << zip_code
end
puts <<~LOG
  After processing #{row_count} rows, I found
    * #{ZIPS_BY_PARTNER[WNY_STEM_HUB_ID].size} zip codes for WNY STEM Hub
    * #{ZIPS_BY_PARTNER[MOUSE_ID].size} zip codes for Mouse
LOG

# Initialize new mappings for the two regional partners
new_mappings = []
REGIONAL_PARTNER_IDS.each do |regional_partner_id|
  ZIPS_BY_PARTNER[regional_partner_id].each do |zip_code|
    new_mappings << Pd::RegionalPartnerMapping.new(regional_partner_id: regional_partner_id, zip_code: zip_code)
  end
end

# One last mapping: Mouse is the default partner for any other New York state zip codes
new_mappings << Pd::RegionalPartnerMapping.new(regional_partner_id: MOUSE_ID, state: 'NY')

ActiveRecord::Base.transaction do
  # Delete existing mappings for these two regional partners
  Pd::RegionalPartnerMapping.where(regional_partner_id: [WNY_STEM_HUB_ID, MOUSE_ID]).delete_all

  # Bulk-import the new mappings
  result = Pd::RegionalPartnerMapping.import new_mappings

  rows_inserted = new_mappings.count - result.failed_instances.count
  puts "Imported #{rows_inserted} mappings"
  unless result.failed_instances.empty?
    puts "Failed inserts:"
    result.failed_instances.each {|x| puts x.inspect}
  end

  # This script is a dry-run until we comment out this last line
  raise ActiveRecord::Rollback.new, "Intentional rollback"
end

puts "Done in #{Time.now - start_time} seconds"
