require 'test_helper'

class RegionalPartnersSchoolDistrictTest < ActiveSupport::TestCase
  test "regional partners school districts initialized from tsv" do
    # populate school_districts and regional_partners, which we depend on as foreign keys
    RegionalPartner.find_or_create_all_from_tsv('test/fixtures/regional_partners.tsv')
    SchoolDistrict.find_or_create_all_from_tsv('test/fixtures/school_districts.tsv')

    RegionalPartnersSchoolDistrict.find_or_create_all_from_tsv('test/fixtures/regional_partners_school_districts.tsv')

    district = SchoolDistrict.find(100002)
    partner = district.regional_partners.first
    assert_not_nil partner
    assert_equal partner.name, 'A+ College Ready'
    assert_equal partner.group, 1

    # rubocop:disable Style/NumericLiterals
    district = SchoolDistrict.find(4800014)
    partner = district.regional_partners.first
    assert_nil partner

    district = SchoolDistrict.find(4800004)
    partner = district.regional_partners.first
    assert_not_nil partner
    assert_equal partner.name, 'Center for STEM Education, The University of Texas at Austin'
    assert_equal partner.group, 2
  end
end
