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
      percentage = key_count > 0 ? 100.0 * value / key_count : 0.0
      rounded_percentage = percentage.round(3)
      cumulatives[key][index] = rounded_percentage
    end
  end

  return cumulatives
end

# Adds any keys in base_hash missing in other_hash to other_hash with value default_value.
def add_missing_keys(base_hash, other_hash, default_value)
  base_hash.keys.each do |key|
    other_hash[key] = default_value unless other_hash.keys.include? key
  end
end
