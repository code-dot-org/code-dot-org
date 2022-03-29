require 'test_helper'
require 'dynamic_config/dcdo'

class AdminNpsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    @not_admin = create(:teacher, username: 'notadmin', email: 'not_admin@email.xx', admin: false)
  end

  generate_admin_only_tests_for :nps_form

  test 'updates dcdo flag to even and odd correctly' do
    sign_in @admin
    DCDO.stubs(:get).with('nps_audience', nil).returns(['none'])
    post :nps_update, params: {audience: 'even'}
    assert_equal(
      "Survey audience updated",
      flash[:notice]
    )
    DCDO.stubs(:get).with('nps_audience', nil).returns(['even'])
    post :nps_update, params: {audience: 'odd'}
    DCDO.stubs(:get).with('nps_audience', nil).returns(['odd'])
    post :nps_update, params: {audience: 'none'}
    DCDO.unstub(:get)
  end

  test 'updates dcdo flag to all and none correctly' do
    sign_in @admin
    post :nps_update, params: {audience: 'all'}
    DCDO.stubs(:get).with('nps_audience', nil).returns(['all'])
    post :nps_update, params: {audience: 'none'}
    DCDO.stubs(:get).with('nps_audience', nil).returns(['none'])
    DCDO.unstub(:get)
  end

  test "nps survey updating is admin only" do
    sign_in @not_admin
    post :nps_update, params: {audience: 'all'}
    assert_response :forbidden
  end

  test "dcdo flag cannot update to unknown audience type" do
    sign_in @admin
    post :nps_update, params: {audience: 'some'}
    assert_equal(
      "Invalid audience type",
      flash[:alert]
    )
  end
end
