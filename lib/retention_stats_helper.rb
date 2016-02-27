#!/usr/bin/env ruby
#
# Helper methods for the retention_stats cron job.
#

# Transforms a hash of array counts to a hash of array cumulative percentages. In particular, the value
# of cumulatives[key][n] := 100.0 * SUM(stats[key][i] : i <= n) / SUM(stats[key][i]).
def get_cumulatives(stats)
  cumulatives = {}

  # Sets cumulatives[key][n] to the intermediate computation SUM(stats[key][i] : i <= n).
  stats.each_pair do |key, data_array|
    cumulatives[key] = Array.new(data_array.length, 0)
    data_array.each_with_index do |value, index|
      (0..index).each do |i|
        cumulatives[key][i] += value
      end
    end
  end

  # Sets cumulatives[key][n] to its appropriate value.
  cumulatives.each_pair do |key, data_array|
    key_count = cumulatives[key][0]
    data_array.each_with_index do |value, index|
      cumulatives[key][index] = key_count > 0 ? 100.0 * value / key_count : 0.0
    end
  end

  return cumulatives
end
