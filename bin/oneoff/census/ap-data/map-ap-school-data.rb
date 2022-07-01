#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'

# This script depends on the StreetAddress gem; because it's the only thing in
# our codebase that does and because these scripts are only included here for
# posterity not for actual use, we don't currently install that gem.
#
# As-is, attempting to run this script will fail with the error:
#
#     cannot load such file -- street_address (LoadError)
#
# To restore, add the following line back to the Gemfile:
#
#     gem 'StreetAddress', require: "street_address"
#
require 'street_address'

ap_data_by_address = {}
CSV.foreach('ap-school-data.csv', {headers: true}) do |row|
  if row['streetAddr1']
    address = "#{row['streetAddr1']}, #{row['city']}, #{row['state']}, #{row['zip']}"
    formatted_address = StreetAddress::US.parse(address.upcase).to_s
    ap_data_by_address[formatted_address] = {school_code: row['school_code'], school_name: row['name']}
  end
end

CSV.open('ap-school-code-map.csv', 'w') do |csv|
  csv << %w(ap_school_code ap_school_name nces_school_id nces_school_name)

  School.find_each do |school|
    address = %w(address_line1 address_line2 address_line3 city state zip).map do |col|
      school.attributes[col].presence
    end.compact.join(', ').upcase

    if address
      CDO.log.info "Processing school id: #{school.id} with address: \"#{address}\""
      begin
        formatted_address = StreetAddress::US.parse(address).to_s.presence
        CDO.log.info "formatted_address: \"#{formatted_address}\""
        ap_data = ap_data_by_address[formatted_address]
        csv << [ap_data[:school_code], ap_data[:school_name], school.id, school.name] if ap_data
      rescue TypeError => e
        CDO.log.error e
      end
    end
  end
end
