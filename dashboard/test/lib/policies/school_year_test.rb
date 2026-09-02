require 'test_helper'

class Policies::SchoolYearTest < ActiveSupport::TestCase
  # A school year is labelled by the year it starts, so the last six months of
  # a calendar year and the first six of the next share a label.
  it 'labels a school year by the year it starts' do
    Timecop.freeze(Date.new(2026, 7, 1)) {assert_equal 2026, Policies::SchoolYear.starting_year}
    Timecop.freeze(Date.new(2027, 6, 30)) {assert_equal 2026, Policies::SchoolYear.starting_year}
  end

  it 'rolls over on July 1, not January 1' do
    Timecop.freeze(Date.new(2026, 6, 30)) {assert_equal 2025, Policies::SchoolYear.starting_year}
    Timecop.freeze(Date.new(2027, 1, 1)) {assert_equal 2026, Policies::SchoolYear.starting_year}
  end

  it 'accepts a date rather than only reading the clock' do
    assert_equal 2024, Policies::SchoolYear.starting_year(Date.new(2025, 6, 30))
    assert_equal 2025, Policies::SchoolYear.starting_year(Date.new(2025, 7, 1))
  end

  # The format three controllers persist into school_year columns.
  it 'still produces the analytics label the helper has always produced' do
    Timecop.freeze(Date.new(2026, 8, 1)) do
      assert_equal '2026-27', ApplicationController.helpers.school_year
    end
  end
end
