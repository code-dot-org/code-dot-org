require 'test_helper'

class RegionalPartnersSchoolDistrictTest < ActiveSupport::TestCase
  # This data for this test is initialized in seed.rake
  test "regional partners school districts initialized from tsv" do
    district = SchoolDistrict.find(100002)
    partner = district.regional_partner
    assert_not_nil partner
    assert_equal partner.name, 'A+ College Ready'
    assert_equal partner.group, 1

    district = SchoolDistrict.find(200001)
    partner = district.regional_partner
    assert_nil partner

    # rubocop:disable Style/NumericLiterals
    district = SchoolDistrict.find(4800004)
    partner = district.regional_partner
    assert_not_nil partner
    assert_equal partner.name, 'Center for STEM Education, The University of Texas at Austin'
    assert_equal partner.group, 2
  end
end
