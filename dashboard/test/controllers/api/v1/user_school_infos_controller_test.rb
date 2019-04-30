require 'test_helper'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  test "last confirmation date in user school infos table is updated" do
    user_school_info = create :user_school_info
    puts 'Before sign in'
    sign_in user_school_info.user
    puts user_school_info.inspect
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_last_confirmation_date"
    assert_response :success

    assert user_school_info.last_confirmation_date.to_datetime, DateTime.current
  end

  test "last confirmation date is not updated for a user that is not signed in" do
    patch "/api/v1/user_school_infos/-1/update_last_confirmation_date"
    assert_response 302
  end

  test "update last confirmation date will 404 if user id does not exist" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/-1/update_last_confirmation_date"
    assert_response 404
  end

  test 'update last confirmation date will 401 if given a user id other than the person logged in' do
    user_school_info1 = create :user_school_info
    user_school_info2 = create :user_school_info
    sign_in user_school_info2.user
    patch "/api/v1/user_school_infos/#{user_school_info1.id}/update_last_confirmation_date"
    assert_response 401
  end

  test "end_date and last_seen_school_info_interstitial is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_end_date"
    updated_user_school_info = UserSchoolInfo.find(user_school_info.id)

    assert_response :success

    assert updated_user_school_info.end_date.to_datetime, Date.current
    assert updated_user_school_info.user.last_seen_school_info_interstitial.to_datetime, Date.current
  end

  test "school_info_id is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_school_info_id", params: {
      school: {name: 'C school', city: 'Hungtinton river', state: 'Caliii'},
      school_info: {school_type: 'private', state: 'Jersey New', school_name: 'C school', country: 'US'}
    }

    new_user_school_info = UserSchoolInfo.last

    assert_response :success

    assert_difference UserSchoolInfo.count, 1
    assert_not_equal new_user_school_info.id, user_school_info.id
    assert new_user_school_info.school_info_id, user_school_info.school_info_id
  end
end
