#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'net/http'
require 'uri'

CENSUS_BUCKET_NAME = "cdo-census".freeze

CSV.open('ap-school-data.csv', 'w') do |csv|
  csv << %w(school_code name streetAddr1 city state zip)
  (2016..2017).each do |school_year|
    ['CSP', 'CSA'].each do |course|
      object_key = "ap_cs_offerings/#{course}-#{school_year}-#{school_year + 1}.csv"
      begin
        AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
          CSV.foreach(filename, {headers: true}) do |row|
            raw_school_code = row.to_hash['School Code']
            next unless raw_school_code
            normalized_school_code = Census::ApSchoolCode.normalize_school_code(raw_school_code)
            unless normalized_school_code == '000000'
              code = normalized_school_code
              uri = URI.parse("https://public.cbapis.org/organizations/search/ais?name=#{code}&start=0&rows=100&api-key=eparucontent-c44ca3d5-5e76-73ae-8ec4-92da4c3b9a42&callback=_jqjsp&_1514914583340=")
              response = Net::HTTP.get_response uri

              if response.code != '200'
                CDO.log.error "Error processing #{code}: (#{response.code}) #{response.body}"
              else
                json_data = JSON.parse(response.body.sub(/_jqjsp\(/, "").sub(/\)$/, ""))
                if json_data['numFound'] == 0
                  csv << [code]
                else
                  data = json_data['orgAddressList'][0]
                  csv << [code, data['orgName'], data['streetAddr1'], data['city'], data['stateCd'], data['zip5']]
                end
              end
            end
          end
        end
      rescue Aws::S3::Errors::NoSuchKey
        # We don't expect every school year to be there so skip anything that isn't found.
        CDO.log.info "#{object_key} not found in S3 - skipping."
      end
    end
  end
end
