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
end
