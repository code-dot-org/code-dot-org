require 'test_helper'

class AdminReportsHelperTest < ActionView::TestCase
  include AdminReportsHelper

  def test_get_gender_percentage
    assert_equal('66.67%', get_gender_percentage(2, 1))
  end

  def test_get_gender_percentage_division_by_zero
    # Note that '0.00%' is returned by default when both inputs are zero.
    assert_equal('0.00%', get_gender_percentage(0, 0))
  end

  def test_get_percentage_from_ratio
    assert_equal('0.00%', get_percentage_from_ratio(0.0))
    assert_equal('12.34%', get_percentage_from_ratio(0.1234))
    assert_equal('100.00%', get_percentage_from_ratio(1.0))
  end

  def test_get_percentage_from_ratio_rounding
    assert_equal('0.00%', get_percentage_from_ratio(0.0000135))
    assert_equal('12.35%', get_percentage_from_ratio(0.1234567))
    assert_equal('100.00%', get_percentage_from_ratio(0.9999864))
  end

  def test_get_cumulatives_one_key
    max_counts = {17 => 2}
    stats = {17 => {0 => 2, 1 => 1, 2 => 2}}

    assert_equal({17 => {0 => 100.0, 1 => 60.0, 2 => 40.0}}, get_cumulatives(max_counts, stats))
  end

  def test_get_cumulatives_multiple_keys
    max_counts = {17 => 2, 18 => 1}
    stats = {17 => {0 => 2, 1 => 1, 2 => 2}, 18 => {0 => 1, 1 => 3}}

    assert_equal({17 => {0 => 100.0, 1 => 60.0, 2 => 40.0}, 18 => {0 => 100.0, 1 => 75.0}},
                 get_cumulatives(max_counts, stats))
  end

  def test_get_cumulatives_one_key_with_max_count
    max_counts = {17 => 4}
    stats = {17 => {0 => 2, 1 => 1, 2 => 2}}

    assert_equal({17 => {0 => 100.0, 1 => 60.0, 2 => 40.0, 3 => 0.0, 4 => 0.0}},
                 get_cumulatives(max_counts, stats))
  end

  def test_get_cumulatives_one_key_with_max_count_cutoff
    max_counts = {17 => 1}
    stats = {17 => {0 => 2, 1 => 1, 2 => 2}}

    assert_equal({17 => {0 => 100.0, 1 => 60.0}}, get_cumulatives(max_counts, stats))
  end
end
