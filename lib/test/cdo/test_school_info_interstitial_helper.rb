require_relative '../test_helper'
require 'cdo/school_info_interstitial_helper'

# Tests following spec:
# We should pop up this interstitial again every 7 days unless one of the following is true:
# - The teacher already filled out all the fields (except location)
# - They chose “Homeschool,” “After School”, "Organization" or “Other” for school type
# - Teacher chose a country that’s not “United States”
class SchoolInfoInterstitialHelperTest < Minitest::Test
  def test_complete_if_all_school_info_is_provided
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'
    school_info.full_address = '123 Sesame Street'

    assert_nil school_info.school_id
    refute_nil school_info.school_name
    refute_nil school_info.full_address
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_complete_if_all_school_info_but_location_is_provided
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'

    assert_nil school_info.school_id
    refute_nil school_info.school_name
    assert_nil school_info.full_address
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_complete_if_school_is_found_by_nces_id
    school_info = SchoolInfo.new
    school_info.school_id = 1

    refute_nil school_info.school_id
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_complete_if_school_type_is_homeschool_after_school_organization_other
    school_info = SchoolInfo.new
    school_info.country = 'United States'

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_HOMESCHOOL
    assert SchoolInfoInterstitialHelper.complete? school_info

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL
    assert SchoolInfoInterstitialHelper.complete? school_info

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_ORGANIZATION
    assert SchoolInfoInterstitialHelper.complete? school_info

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_OTHER
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_complete_if_country_is_not_us
    school_info = SchoolInfo.new
    school_info.country = 'Canada'
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_not_complete_without_country
    school_info = SchoolInfo.new
    assert_nil school_info.country
    refute SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_not_complete_if_country_is_us_but_no_school_type_is_set
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    assert_nil school_info.school_type
    refute SchoolInfoInterstitialHelper.complete? school_info
  end

  def test_not_complete_if_country_is_us_and_school_type_is_public_private_charter_but_other_information_is_missing
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    refute SchoolInfoInterstitialHelper.complete? school_info

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PRIVATE
    refute SchoolInfoInterstitialHelper.complete? school_info

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_CHARTER
    refute SchoolInfoInterstitialHelper.complete? school_info
  end
end
