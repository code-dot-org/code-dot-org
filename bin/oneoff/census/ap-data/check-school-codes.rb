#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'net/http'
require 'uri'

puts "school_code,nces_school_id,nces_school_name,nces_school_city,nces_school_state,nces_school_zip,ai_school_name,ai_school_city,ai_school_state,ai_school_zip"
Census::ApCsOffering.find_each do |offering|
  code = offering.ap_school_code.school_code
  school = offering.school

  uri = URI.parse("https://public.cbapis.org/organizations/search/ais?name=#{code}&start=0&rows=100&api-key=eparucontent-c44ca3d5-5e76-73ae-8ec4-92da4c3b9a42&callback=_jqjsp&_1514914583340=")
  response = Net::HTTP.get_response uri

  if response.code != '200'
    puts "Error processing #{code}: (#{response.code}) #{response.body}"
  else
    json_data = JSON.parse(response.body.sub(/_jqjsp\(/, "").sub(/\)$/, ""))
    if json_data['numFound'] == 0
      puts "#{code},#{school.id},#{school.name},#{school.city},#{school.state},#{school.zip},,,,"
    else
      data = json_data['orgAddressList'][0]
      if (school.state != data['stateCd']) || (school.zip != data['zip5'])
        puts "#{code},#{school.id},#{school.name},#{school.city},#{school.state},#{school.zip},#{data['orgName']},#{data['city']},#{data['stateCd']},#{data['zip5']}"
      end
    end
  end
end
