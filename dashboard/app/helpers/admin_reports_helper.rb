module AdminReportsHelper
  # Computes the ratio of this_gender to this_gender and other_gender, returning the percentage as
  # a string with a trailing percentage sign. Returns '0.00%' if both counts are zero.
  def get_gender_percentage(this_gender_count, other_gender_count)
    return get_percentage_from_ratio(
      this_gender_count.to_f / [this_gender_count + other_gender_count, 1].max.to_f)
  end

  # Computes and rounds to two decimal places a percentage (0% to 100%) from a ratio (0.0 to 1.0).
  # Returns the string representation of the percentage, with a percent sign.
  def get_percentage_from_ratio(ratio)
    return number_with_precision(100.0 * ratio, precision: 2).to_s + '%'
  end

  # From a hash of hashes giving counts, get_cumulatives constructs a hash of hashes giving
  # cumulative counts, e.g., transforms stats[key][subkey] = count to cumulatives[key][subkey] =
  # cumulative_count, where cumulative_count := SUM(stats[key][i] : i <= subkey).
  # The max_counts parameter is used to determine the space of subkeys, e.g.,
  # cumulatives[key][subkey] will exist exactly when subkey <= max_counts[key].
  def get_cumulatives(max_counts, stats)
    # Construct the cumulatives hash manually. Since we ultimately want to display zero values, we
    # explicitly initialize the hash.
    cumulatives = Hash.new {|hash, key| hash[key] = {}}
    max_counts.each do |key, max_count|
      (0..max_count).each do |n|
        cumulatives[key][n] = 0
      end
    end
    # Populate the cumulatives hash by incrementing cumulatives[key][subkey] when appropriate.
    stats.each do |key, key_data|
      key_data.each do |subkey, subkey_count|
        # Add stats[key][subkey] to all appropriate cumulatives[key] buckets.
        top_index = [subkey.to_s.to_i, max_counts[key]].min
        (0..top_index).each do |subkey_index|
          cumulatives[key][subkey_index] += subkey_count
        end
      end
      # Scale cumulatives[key][subkey] to give a percentage rather than an absolute count.
      total_subkey_count = cumulatives[key][0]
      cumulatives[key].each do |subkey, subkey_count|
        cumulatives[key][subkey] = 100.0 * subkey_count / total_subkey_count
      end
    end
    return cumulatives
  end
end
