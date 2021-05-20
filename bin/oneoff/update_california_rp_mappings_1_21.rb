#!/usr/bin/env ruby

# This script remaps the LAUSD regional partner mappings to be those specified in
# lausd.csv. It will delete all current LAUSD mappings and replace them with those found in the csv.
# It then removes any zip codes present in USC that are also in the new LAUSD mapping
# from the USC mapping.

require_relative '../../dashboard/config/environment'

LAUSD_ID = 80
USC_ID = 111
REGIONAL_PARTNER_IDS = [LAUSD_ID, USC_ID]

ZIPS_BY_PARTNER = {
  LAUSD_ID => [],
  USC_ID => []
}

lausd_mappings = []

CSV.foreach(deploy_dir('bin/oneoff/lausd.csv'), headers: true) do |row|
  partner_id = row["Partner"]
  zip_code = row["ZIP"]
  ZIPS_BY_PARTNER[LAUSD_ID] << zip_code
  lausd_mappings << Pd::RegionalPartnerMapping.new(regional_partner_id: partner_id, zip_code: zip_code)
end

ZIPS_BY_PARTNER[USC_ID] = Pd::RegionalPartnerMapping.where(regional_partner_id: USC_ID).pluck(:zip_code)
intersection = ZIPS_BY_PARTNER[USC_ID] & ZIPS_BY_PARTNER[LAUSD_ID]

if lausd_mappings.count > 0
  ActiveRecord::Base.transaction do
    # delete all current LAUSD mappings and replace with new mappings
    Pd::RegionalPartnerMapping.where(regional_partner_id: LAUSD_ID).delete_all
    result = Pd::RegionalPartnerMapping.import lausd_mappings
    rows_inserted = lausd_mappings.count - result.failed_instances.count
    puts "Imported #{rows_inserted} mappings"
    unless result.failed_instances.empty?
      puts "Failed inserts:"
      result.failed_instances.each {|x| puts x.inspect}
    end

    # any zips that are in the new LAUSD mapping and the current USC mapping should be removed from USC
    delete_result = Pd::RegionalPartnerMapping.where(regional_partner_id: USC_ID).where(zip_code: intersection).delete_all
    puts "Deleted #{delete_result} mappings"

    # This script is a dry-run unless we comment out this last line
    raise ActiveRecord::Rollback.new, "Intentional rollback"
  end
else
  puts "Could not find LAUSD mappings"
end
