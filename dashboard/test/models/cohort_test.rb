require 'test_helper'

class CohortTest < ActiveSupport::TestCase
  test "has many districts" do
    d1 = create :district
    d2 = create :district

    c = create :cohort, name: 'C1'

    # ugggh creating too much stuff in fixtures makes tests really fragile
    CohortsDistrict.destroy_all

    CohortsDistrict.create!(cohort_id: c.id, district_id: d1.id, max_teachers: 6)
    CohortsDistrict.create!(cohort_id: c.id, district_id: d2.id, max_teachers: 10)

    c = c.reload
    assert_equal [6, 10], c.cohorts_districts.collect(&:max_teachers)
    assert_equal [d1, d2], c.districts
  end
end
