require 'test_helper'

# Tests following spec:
# We should pop up this interstitial again every 7 days unless one of the following is true:
# - The teacher already filled out all the fields (except location)
# - They chose “Homeschool,” “After School”, "Organization" or “Other” for school type
# - Teacher chose a country that’s not “United States”
class SchoolInfoInterstitialHelperTest < ActiveSupport::TestCase
  test 'school info confirmation dialog is shown when all information is provided' do
    user = create :teacher, last_seen_school_info_interstitial: 7.days.ago

    school_info = create :school_info

    assert_equal school_info.school_type, SchoolInfo::SCHOOL_TYPE_PUBLIC

    create :user_school_info, school_info_id: school_info.id, user_id: user.id, last_confirmation_date: 2.years.ago, start_date: user.created_at

    assert SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog? user
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
