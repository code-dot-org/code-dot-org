require 'test_helper'

class ReportsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')
  end

  test "should get prizes" do
    get :prizes
    assert_response :success
  end

  test "should get prizes if not admin" do
    sign_in @not_admin
    get :prizes
    assert_response :success
  end

  test "should not get prizes if not signed in" do
    sign_out @admin
    get :prizes

    assert_redirected_to_sign_in
  end
end
