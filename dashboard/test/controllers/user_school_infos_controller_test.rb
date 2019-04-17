require 'test_helper'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  test "last confirmation date in user school infos table is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.user.id}/update_last_confirmation_date/", params: {
      last_confirmation_date: DateTime.now
    }
    assert_response :success
  end

  test "end date and last seen school info interstitial is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/#{user_school_info.user.id}/update_end_date", params: {
      end_date: DateTime.now
    }
    assert_response :success
  end
end
