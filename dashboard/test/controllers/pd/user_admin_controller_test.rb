require 'test_helper'

class Pd::UserAdminControllerTest < ActionDispatch::IntegrationTest
  test "should get find user" do
    get pd_user_admin_find_user_url
    assert_response :success
  end
end
