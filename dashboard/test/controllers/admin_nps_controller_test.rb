require 'test_helper'

class AdminNpsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
  end

  generate_admin_only_tests_for :nps_form

  test 'updates dcdo flag to even and odd correctly' do
    sign_in @admin
    assert_equal DCDO.get('nps_audience', 'null'), 'none'
    post :nps_update, params: {audience: 'even'}
    assert_equal DCDO.get('nps_audience', 'null'), 'even'
    post :nps_update, params: {audience: 'odd'}
    assert_equal DCDO.get('nps_audience', 'null'), 'odd'
    post :nps_update, params: {audience: 'none'}
  end

  test 'updates dcdo flag to all and none correctly' do
    sign_in @admin
    post :nps_update, params: {audience: 'all'}
    assert_equal DCDO.get('nps_audience', 'null'), 'all'
    post :nps_update, params: {audience: 'none'}
    assert_equal DCDO.get('nps_audience', 'null'), 'none'
  end
end
