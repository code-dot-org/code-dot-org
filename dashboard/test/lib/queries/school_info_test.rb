require 'test_helper'

class Queries::SchoolInfoTest < ActiveSupport::TestCase
  setup do
    @user = create(:teacher)
  end

  test 'when school_info exists with an associated school' do
    school = create(:school, name: 'Test School', school_type: 'public', id: '1', zip: '12345')
    school_info = create(:school_info, school: school)
    user_school_info = create(:user_school_info, user: @user, school_info: school_info)

    Queries::UserSchoolInfo.expects(:last_complete).with(@user).returns(user_school_info)

    result = Queries::SchoolInfo.current_school(@user)

    expected_result = {
      school_name: 'Test School',
      school_type: 'public',
      school_id: '1',
      school_zip: '12345',
      country: 'US',
      user_school_info_id: user_school_info.id
    }

    assert_equal expected_result, result
  end

  test 'when US school_info exists without an associated school' do
    school_info = create(:school_info_us, school_name: 'Unknown School', zip: 1234) # zip column in school_infos is an int, but probably shouldn't be
    user_school_info = create(:user_school_info, user: @user, school_info: school_info)

    Queries::UserSchoolInfo.stubs(:last_complete).with(@user).returns(user_school_info)

    result = Queries::SchoolInfo.current_school(@user)

    expected_result = {
      school_name: 'Unknown School',
      school_type: nil,
      school_id: nil,
      school_zip: '01234', # zip is padded with a leading zero
      country: 'US',
      user_school_info_id: user_school_info.id
    }

    assert_equal expected_result, result
  end

  test 'when US school_info exists for a non-school setting' do
    school_info = create(:school_info_us, school_name: 'Not a school', zip: 12, school_type: SchoolInfo::SCHOOL_TYPE_NO_SCHOOL_SETTING)
    user_school_info = create(:user_school_info, user: @user, school_info: school_info)

    Queries::UserSchoolInfo.stubs(:last_complete).with(@user).returns(user_school_info)

    result = Queries::SchoolInfo.current_school(@user)

    expected_result = {
      school_name: 'Not a school',
      school_type: SchoolInfo::SCHOOL_TYPE_NO_SCHOOL_SETTING,
      school_id: nil,
      school_zip: '00012', # zip is padded with leading zeros
      country: 'US',
      user_school_info_id: user_school_info.id
    }

    assert_equal expected_result, result
  end

  test 'when non-US school_info exists without an associated school' do
    school_info = create(:school_info_non_us, school_name: 'Non-US School', school_type: nil, full_address: nil)
    user_school_info = create(:user_school_info, user: @user, school_info: school_info)

    Queries::UserSchoolInfo.stubs(:last_complete).with(@user).returns(user_school_info)

    result = Queries::SchoolInfo.current_school(@user)

    expected_result = {
      school_name: 'Non-US School',
      school_type: nil,
      school_id: nil,
      school_zip: nil,
      country: 'GB',
      user_school_info_id: user_school_info.id
    }

    assert_equal expected_result, result
  end

  test 'when no school_info exists' do
    Queries::UserSchoolInfo.stubs(:last_complete).with(@user).returns(nil)

    result = Queries::SchoolInfo.current_school(@user)
    assert_nil result
  end
end
