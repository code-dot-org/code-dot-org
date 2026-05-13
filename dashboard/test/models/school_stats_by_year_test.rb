require 'test_helper'

class SchoolStatsByYearTest < ActiveSupport::TestCase
  test 'can create school_stats_by_year with valid status' do
    school = create(:school)
    school_stats = create(:school_stats_by_year, school: school, status: SchoolStatsByYear::STATUS_OPEN)
    assert school_stats.valid?
    assert_empty school_stats.errors[:status]
  end

  test 'cannot create school_stats_by_year with invalid status' do
    school = create(:school)
    school_stats = build(:school_stats_by_year, school: school, status: 'invalid_status')
    refute school_stats.save
    assert_includes school_stats.errors[:status], "is not included in the list"
  end
end
