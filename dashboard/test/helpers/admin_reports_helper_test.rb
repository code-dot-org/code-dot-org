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
end
