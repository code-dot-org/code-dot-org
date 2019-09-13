require 'test_helper'
require 'timecop'

# Tests following spec:
# We should pop up this interstitial again every 7 days unless one of the following is true:
# - The teacher already filled out all the fields (except location)
# - They chose “Homeschool,” “After School”, "Organization" or “Other” for school type
# - Teacher chose a country that’s not “United States”
class SchoolInfoInterstitialHelperTest < ActiveSupport::TestCase
  setup do
    Timecop.freeze
  end

  teardown do
    Timecop.return
  end

  test 'does not show a dialog if user is not a teacher' do
    user = create :user

    refute user.teacher?

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user
  end

  test 'does not show a dialog if the account is less than 7 days old' do
    user = create :teacher, created_at: 6.days.ago

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user
  end

  test 'shows school info interstitial if account has no school info' do
    user = create :teacher, created_at: 7.days.ago

    assert_nil user.school_info
    assert_empty user.user_school_infos

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    assert SchoolInfoInterstitialHelper.show? user
  end

  test 'shows school info interstitial if account has incomplete school info' do
    user = create :teacher, created_at: 14.days.ago
    user.update! school_info: create(
      :school_info,
      school_id: nil,
      country: nil,
      validation_type: SchoolInfo::VALIDATION_NONE
    )

    refute user.school_info.complete?
    assert_nil Queries::UserSchoolInfo.by_user(user).last_complete.school_info

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    assert SchoolInfoInterstitialHelper.show? user
  end

  test 'does not show a dialog if the last complete school_info is not a US school' do
    user = create :teacher, created_at: 14.days.ago
    user.update! school_info: create(
      :school_info,
      school_id: nil,
      country: 'Canada',
      validation_type: SchoolInfo::VALIDATION_NONE
    )
    user.reload

    refute Queries::UserSchoolInfo.by_user(user).last_complete.school_info.usa?

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user
  end

  test 'does not show a dialog when the last complete school_info school type is not private, public or charter' do
    homeschool_teacher = create :teacher
    homeschool_teacher.update! school_info: create(:school_info_us_homeschool)
    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? homeschool_teacher
    refute SchoolInfoInterstitialHelper.show? homeschool_teacher

    afterschool_teacher = create :teacher
    afterschool_teacher.update! school_info: create(:school_info_us_after_school)
    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? afterschool_teacher
    refute SchoolInfoInterstitialHelper.show? afterschool_teacher

    organization_teacher = create :teacher
    organization_teacher.update! school_info: create(
      :school_info_us_homeschool,
      school_type: SchoolInfo::SCHOOL_TYPE_ORGANIZATION
    )
    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? organization_teacher
    refute SchoolInfoInterstitialHelper.show? organization_teacher

    other_teacher = create :teacher
    other_teacher.update! school_info: create(
      :school_info_us_homeschool,
      school_type: SchoolInfo::SCHOOL_TYPE_ORGANIZATION
    )
    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? other_teacher
    refute SchoolInfoInterstitialHelper.show? other_teacher
  end

  test 'does not show a dialog when last complete school_info was confirmed less than a year ago' do
    user = create :teacher
    user.update! school_info: create(:school_info)

    Timecop.travel 364.days
    assert user.user_school_infos.last.school_info.complete?
    assert user.user_school_infos.last.last_confirmation_date > 1.year.ago

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user
  end

  test 'does not show a dialog if it has been less than 7 days since we asked' do
    user = create :teacher
    user.update! school_info: create(:school_info)

    Timecop.travel 1.year
    user.update! last_seen_school_info_interstitial: DateTime.now

    assert user.last_seen_school_info_interstitial > 7.days.ago

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user
  end

  test 'shows the confirmation dialog if all above conditions are met' do
    user = create :teacher
    user.update! school_info: create(:school_info)

    Timecop.travel 1.year
    assert SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    # We never reach the call for the school_info_interstitial
  end

  test 'user school info updates as expected over lifetime of user' do
    user = create :teacher

    assert_nil user.school_info
    assert_empty user.user_school_infos

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user

    Timecop.travel 7.days

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    assert SchoolInfoInterstitialHelper.show? user

    user.update! school_info: create(:school_info)
    user.reload

    assert_equal 1, user.user_school_infos.count
    assert_equal user.school_info, Queries::UserSchoolInfo.by_user(user).last_complete.school_info

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user

    Timecop.travel 1.year

    assert SchoolInfoInterstitialHelper.show_confirmation_dialog? user

    user.update! school_info: create(:school_info)
    user.reload

    assert_equal 2, user.user_school_infos.count
    assert_equal user.school_info, Queries::UserSchoolInfo.by_user(user).last_complete.school_info

    refute SchoolInfoInterstitialHelper.show_confirmation_dialog? user
    refute SchoolInfoInterstitialHelper.show? user
  end
end
