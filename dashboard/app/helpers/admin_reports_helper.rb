module AdminReportsHelper
  # Computes the ratio of this_gender to this_gender and other_gender, returning the percentage as
  # a string with a trailing percentage sign.
  def get_gender_percentage(this_gender_count, other_gender_count)
    return number_with_precision(100.0 * this_gender_count /
        [this_gender_count + other_gender_count, 1].max,
       precision: 2).to_s + "%"
  end
end
