#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'net/http'
require 'uri'

class ApDataLoader
  CENSUS_BUCKET_NAME = "cdo-census".freeze
  OUTPUT_FILENAME = 'ap-school-data.csv'.freeze

  def initialize
    @ap_data_cache = {}
  end

  def process_csv(csv, filename, school_code_field_name)
    CSV.foreach(filename, {headers: true}) do |row|
      raw_school_code = row.to_hash[school_code_field_name]
      next unless raw_school_code
      normalized_school_code = Census::ApSchoolCode.normalize_school_code(raw_school_code)
      unless normalized_school_code == '000000'
        if @ap_data_cache[normalized_school_code]
          data = @ap_data_cache[normalized_school_code]
          csv << [normalized_school_code, data['name'], data['streetAddr1'], data['city'], data['stateCd'], data['zip5']]
        else
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
              @ap_data_cache[code] = {
                name: data['orgName'],
                streetAddr1: data['streetAddr1'],
                city: data['city'],
                state: data['stateCd'],
                zip: data['zip5'],
              }
            end
          end
        end
      end
    end
  end

  def cache_existing_data
    if File.file? OUTPUT_FILENAME
      CSV.foreach(OUTPUT_FILENAME, {headers: true}) do |row|
        data = row.to_hash
        school_code = data['school_code']
        name = data['name']
        street_addr_1 = data['streetAddr1']
        city = data['city']
        state = data['state']
        zip = data['zip']
        @ap_data_cache[school_code] = {
          name: name,
          streetAddr1: street_addr_1,
          city: city,
          state: state,
          zip: zip,
        }
      end
    end
  end

  def load_data
    cache_existing_data
    CSV.open(OUTPUT_FILENAME, 'w') do |csv|
      csv << %w(school_code name streetAddr1 city state zip)
      (2016..2017).each do |school_year|
        ['CSP', 'CSA'].each do |course|
          object_key = "ap_cs_offerings/#{course}-#{school_year}-#{school_year + 1}.csv"
          begin
            AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
              process_csv(csv, filename, 'School Code')
            end
          rescue Aws::S3::Errors::NoSuchKey
            # We don't expect every school year to be there so skip anything that isn't found.
            CDO.log.info "#{object_key} not found in S3 - skipping."
          end
        end
      end
      AWS::S3.process_file(CENSUS_BUCKET_NAME, 'nces_ai_crosswalk.csv') do |filename|
        process_csv(csv, filename, 'ai_code')
      end
    end
  end
end

ApDataLoader.new.load_data
