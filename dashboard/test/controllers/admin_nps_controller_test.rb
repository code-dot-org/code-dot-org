require 'test_helper'
require 'dynamic_config/dcdo'

class AdminNpsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    @not_admin = create(:teacher, username: 'notadmin', email: 'not_admin@email.xx', admin: false)
  end

  generate_admin_only_tests_for :nps_form

  test 'flashes alert when audience correctly updated' do
    sign_in @admin
    DCDO.stubs(:set).with('nps_audience', 'none').returns(['none'])
    DCDO.expects(:set).with('nps_audience', 'none')
    post :nps_update, params: {audience: 'none'}
    assert_equal(
      "Survey audience updated",
      flash[:notice]
    )
    DCDO.unstub(:set)
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
