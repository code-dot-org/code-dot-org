#!/usr/bin/env ruby

# Designed to be run in pegasus/cache on production-daemon, with the date range
# as specified below.  This simple script counts up the number of HOC "starts"
# and buckets by country.  The source data is previously geocoded by
# geocode_hoc_activity, and is stored in daily JSON files by analyze_hoc_activity.

require 'json'

def main
  results = {}

  (3..9).each do |d|
    file = File.read(format('HourOfActivity_Results_2018-12-%02d.json', d))

    data_hash = JSON.parse(file)
    countries = data_hash["countries"]

    countries.each do |country|
      country_name = country[0]
      country_count = country[1]

      if results[country_name]
        results[country_name] += country_count
      else
        results[country_name] = country_count
      end
    end
  end

  puts results
end

main
