require 'test_helper'

class DistrictTest < ActiveSupport::TestCase
  test "destroying district removes it from a cohort" do
    cd = create :cohorts_district
    district = cd.district
    district.reload
    cohort = cd.cohort
    cohort.reload

    assert_does_not_destroy(Cohort) do
      assert_destroys(District, CohortsDistrict) do
        assert_difference "cohort.reload.districts.count", -1 do
          district.destroy
        end
      end
    end
  end
end
