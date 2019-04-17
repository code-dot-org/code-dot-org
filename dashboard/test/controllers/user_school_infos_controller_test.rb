require 'test_helper'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  test "last confirmation date in user school infos table is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_last_confirmation_date/"
    assert_response :success
  end

  test "404 is returned if id is invalid" do
    patch "/api/v1/user_school_infos/#{-1}/update_last_confirmation_date/"
    assert_response 404
  end

  test "end date is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_end_date"
    assert_response :success
  end

  test "school_info_id is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_school_info_id", params: {
      school: {name: 'C school', city: 'Hungtinton river', state: 'Caliii'},
      school_info: {school_type: 'private', state: 'Jersey New', school_name: 'C school', country: 'US'}
    }
    assert_response :success
  end
end
