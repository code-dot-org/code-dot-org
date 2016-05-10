#!/usr/bin/env ruby
# A simple tool to display a histogram of the number of github reverts
# bucketed by month. Reverts are identified heuristically by looking
# for commits with "revert" in title or description.

require 'date'

# Gather the dates of the reverts from the git log.
revert_dates = `git log | grep -i -C 3 revert | grep Date | sed "s/\s*Date:   //"`
dates = []
revert_dates.split("\n").each do |revert_date|
  # Expected format:
  # Thu Oct 2 16:05:32 2014 -0700
  parts = revert_date.split(' ')
  raise "Unexpected date string format #{revert_date}" unless parts.length == 6
  dates << Date.parse([parts[1], parts[2], parts[4]].join(' '))
end

# Count the number of reverts by month.
histogram = Hash.new {|hash, key| hash[key] = 0}
dates.sort.each do |date|
  bucketed_date = date.strftime("%Y-%m")
  histogram[bucketed_date] += 1
end

# Display the histogram.
histogram.each do |date, count|
  puts "#{date}, #{count.to_s.rjust(3)}, #{'=' * count}"
end
