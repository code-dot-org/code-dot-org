# A simple tool to display a histogram of the number of github reverts
# bucketed by month. Reverts are identified heuristically by looking
# for commits with "revert" in title or description.

require 'date'

# Gather the dates of the reverts from the git log.
revert_dates = `git log | grep -i -C 3 revert | grep Date | sed "s/\s*Date:   //"`
dates = []
for revert_date in revert_dates.split("\n")
  # Expected format:
  # Thu Oct 2 16:05:32 2014 -0700
  parts = revert_date.split(' ')
  raise "Unexpected date string format #{revert_date}" unless parts.length == 6
  dates << Date.parse([parts[1], parts[2], parts[4]].join(' '))
end

# Count the number of reverts by month.
histogram = Hash.new {|hash, key| hash[key] = 0}
for date in dates.sort
  bucketed_date = date.strftime("%Y-%m")
  histogram[bucketed_date] += 1
end

# Display the histogram.
for date, count in histogram
  puts "#{date},#{count.to_s.rjust(3)},#{'*' * count}"
end
