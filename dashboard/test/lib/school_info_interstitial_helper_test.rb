require 'test_helper'

# Tests following spec:
# We should pop up this interstitial again every 7 days unless one of the following is true:
# - The teacher already filled out all the fields (except location)
# - They chose “Homeschool,” “After School”, "Organization" or “Other” for school type
# - Teacher chose a country that’s not “United States”
class SchoolInfoInterstitialHelperTest < ActiveSupport::TestCase
  test 'complete if all school info is provided' do
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

  test 'complete if all school info but location is provided' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'

    assert_nil school_info.school_id
    refute_nil school_info.school_name
    assert_nil school_info.full_address
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  test 'complete if school is found by NCES id' do
    school_info = SchoolInfo.new
    school_info.school_id = 1

    refute_nil school_info.school_id
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  test 'complete if school type is homeschool/after school/organization/other' do
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

  test 'complete if country is not US' do
    school_info = SchoolInfo.new
    school_info.country = 'Canada'
    assert SchoolInfoInterstitialHelper.complete? school_info
  end

  test 'not complete without country' do
    school_info = SchoolInfo.new
    assert_nil school_info.country
    refute SchoolInfoInterstitialHelper.complete? school_info
  end

  test 'not complete if country is US but no school type is set' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    assert_nil school_info.school_type
    refute SchoolInfoInterstitialHelper.complete? school_info
  end

  test 'not complete if country is US and school type is public/private/charter but other information is missing' do
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
