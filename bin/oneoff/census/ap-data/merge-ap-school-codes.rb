#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'street_address'

CENSUS_BUCKET_NAME = "cdo-census".freeze

@school_id_for_ap_code = {}
@school_code_for_school_id = {}

def set_id_mapping(school_code, school_id)
  existing_mapping_for_code = @school_id_for_ap_code[school_code]
  existing_mapping_for_id = @school_code_for_school_id[school_id]

  if existing_mapping_for_id != school_code || existing_mapping_for_code != school_id
    # clear out old mappings
    @school_id_for_ap_code.delete(school_code)
    @school_code_for_school_id.delete(existing_mapping_for_code)
    @school_id_for_ap_code.delete(existing_mapping_for_id)
    @school_code_for_school_id.delete(school_id)

    @school_id_for_ap_code[school_code] = school_id
    @school_code_for_school_id[school_id] = school_code
  end
end

# Initially populate mapping with crosswalk data
# taking the first result for a given NCES school_id
AWS::S3.process_file(CENSUS_BUCKET_NAME, 'nces_ai_crosswalk.csv') do |filename|
  CSV.foreach(filename, {headers: true}) do |row|
    ap_code = row['ai_code']
    nces_id = row['nces_id']

    unless @school_code_for_school_id[nces_id] || @school_id_for_ap_code[ap_code]
      set_id_mapping(ap_code, nces_id)
    end
  end
end

# Overwrite any mappings where we have found a match.
CSV.foreach('ap-school-code-map-deduped.csv', {headers: true}) do |row|
  school_code = row['ap_school_code']
  school_id = row['nces_school_id']

  set_id_mapping(school_code, school_id)
end

# Keep any mappings that already exist
Census::ApSchoolCode.find_each do |ap_school_code|
  set_id_mapping(ap_school_code.school_code, ap_school_code.school_id)
end

CSV.open('ap-school-code-map-merged.csv', 'w') do |csv|
  csv << %w(school_code school_id)
  @school_id_for_ap_code.each do |school_code, school_id|
    csv << [school_code, school_id]
  end
end
