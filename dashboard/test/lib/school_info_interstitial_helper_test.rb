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

  test 'school info confirmation dialog is shown when all information is provided' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    school_info = create :school_info

    assert_equal school_info.school_type, SchoolInfo::SCHOOL_TYPE_PUBLIC

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    assert SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'last_seen_school_info_interstitial is updated' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    original_value = user.last_seen_school_info_interstitial

    school_info = create :school_info

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    assert SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user

    updated_value = user.last_seen_school_info_interstitial

    refute_equal original_value, updated_value
  end

  test 'last_seen_school_info_interstitial is not updated when dialog is not shown' do
    user = create :teacher, last_seen_school_info_interstitial: 6.days.ago

    original_value = user.last_seen_school_info_interstitial

    school_info = create :school_info

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user

    updated_value = user.last_seen_school_info_interstitial

    assert_equal original_value, updated_value
  end

  test 'school info confirmation dialog is not shown when the US school type is not private, public or charter' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    school_info = create :school_info_us_homeschool

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'school info confirmation dialog is not shown when the country is non-US' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    school_info = create :school_info_non_us

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'school info confirmation dialog is not shown if the last seen school interstitial is less than 7 days' do
    user = create :teacher, last_seen_school_info_interstitial: 6.days.ago

    school_info = create :school_info

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'for form completeness' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    school_info = create :school_info, school_id: nil, country: nil, validation_type: SchoolInfo::VALIDATION_NONE

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'school info confirmation dialog is not shown when the user school infos table is empty' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    user.user_school_infos = []

    assert_nil user.school_info
    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'does not show school info confirmation dialog if user is not a teacher' do
    user = create :user

    school_info = create :school_info

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    assert_equal user.user_type, 'student'
    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end

  test 'does not show school info confirmation dialog when last confirmation date is less than a year' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    school_info = create :school_info

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 1.day.ago, start_date: user.created_at

    refute SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
  end
end
