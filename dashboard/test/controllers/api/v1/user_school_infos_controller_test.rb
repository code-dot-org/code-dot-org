require 'test_helper'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  test "last confirmation date in user school infos table is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_last_confirmation_date"
    assert_response :success

    assert user_school_info.last_confirmation_date.to_datetime, DateTime.current
  end

  test "will redirect user to sign in" do
    patch "/api/v1/user_school_infos/-1/update_last_confirmation_date"
    assert_response 302
  end

  test "last confirmation date will 404 if user id does not exist" do
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
    assert_response 403
  end

  test "end_date and last_seen_school_info_interstitial are updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_end_date"
    updated_user_school_info = UserSchoolInfo.find(user_school_info.id)

    assert_response :success

    assert updated_user_school_info.end_date.to_datetime, Date.current
    assert updated_user_school_info.user.last_seen_school_info_interstitial.to_datetime, Date.current
  end

  test "end_date and last_seen_school_info_interstitial are not updated if user id other than the person logged in is used." do
    user_school_info3 = create :user_school_info
    user_school_info4 = create :user_school_info
    sign_in user_school_info4.user
    patch "/api/v1/user_school_infos/#{user_school_info3.id}/update_end_date"

    assert_response 403
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

    assert_not_equal new_user_school_info.id, user_school_info.id
    assert new_user_school_info.school_info_id, user_school_info.school_info_id
  end

  test "school_info_id is not updated when an invalid user id is passed " do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/-1/update_school_info_id", params: {
      school: {name: 'C school', city: 'Hungtinton river', state: 'Caliii'},
      school_info: {school_type: 'private', state: 'Jersey New', school_name: 'C school', country: 'US'}
    }
    assert_response 404
  end

  test "user is redirected to sign in" do
    create :user_school_info
    patch "/api/v1/user_school_infos/-1/update_school_info_id", params: {
      school: {name: 'C school', city: 'Hungtinton river', state: 'Caliii'},
      school_info: {school_type: 'private', state: 'Jersey New', school_name: 'C school', country: 'US'}
    }
    assert_response 302
  end

  test "logged in user cannot update another user's school info" do
    user_school_info1 = create :user_school_info
    user_school_info2 = create :user_school_info
    sign_in user_school_info2.user
    patch "/api/v1/user_school_infos/#{user_school_info1.id}/update_school_info_id", params: {
      school: {name: 'C school', city: 'Hungtinton river', state: 'Caliii'},
      school_info: {school_type: 'private', state: 'Jersey New', school_name: 'C school', country: 'US'}
    }
    assert_response 403
  end
end
