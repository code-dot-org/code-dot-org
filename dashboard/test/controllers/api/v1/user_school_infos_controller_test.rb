require 'test_helper'

# to do
#  testing controller
#  authenticating user
# creating another school_id

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  test "last confirmation date in user school infos table is updated" do
    user_school_info = create :user_school_info
    puts 'Before sign in'
    sign_in user_school_info.user
    puts user_school_info.id
    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_last_confirmation_date/"
    assert_response :success

    assert user_school_info.last_confirmation_date.to_datetime, DateTime.current
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

    assert user_school_info.end_date.to_datetime, Date.current
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

  # signed out user can't update UserSchoolInfo
  test "last confirmation date is not updated for a user that is not signed in" do
    patch :update_last_confirmation_date, params: {user_id: 234}
    assert_response 403
  end

  test "update last confirmation will 403 if user id does not exist" do
    sign_in user_school_info.user
    patch :update_last_confirmation_date, params: {user_id: '-1'}
    assert_response 403
  end

  # signed in user can only update UserSchoolInfo that belongs to them
  test 'update last confirmation date will 403 if given a user id other than the person logged in' do
    sign_in(@user)
    patch :update_last_confirmation_date, params: {user_id: '456'}
    assert_response 403
  end

  # # tests validating that non-whitelisted params are ignored
  # test "non-whitelisted params are ignored when school_info_id is updated" do
  #   user_school_info = create :user_school_info
  #   sign_in user_school_info.user
  #   patch "/api/v1/user_school_infos/#{user_school_info.id}/update_school_info_id", params: {
  #     school: {name: 'C school', city: 'Hungtinton river', state: 'Caliii'},
  #     school_info: {school_type: 'private', state: 'Jersey New', school_name: 'C school', country: 'US'}
  #   }
  #   assert_response :success
  # end

  # these tests should all also verify that the actual data has been updated,

  # not just that the endpoint reported success
end
