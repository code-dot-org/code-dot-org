require 'test_helper'

class DistrictTest < ActiveSupport::TestCase
  test "destroying district removes it from a cohort" do
    cd = create :cohorts_district
    district = cd.district
    district.reload
    cohort = cd.cohort
    cohort.reload

    assert_no_difference "Cohort.count" do
      assert_difference "District.count", -1 do
        assert_difference "CohortsDistrict.count", -1 do
          assert_difference "cohort.reload.districts.count", -1 do
            district.destroy
          end
        end
      end
    end
  end
end
