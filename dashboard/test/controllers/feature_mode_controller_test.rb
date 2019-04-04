require 'test_helper'

class FeatureModeControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)
  end

  test 'redirect if not signed in' do
    sign_out @admin
    get :show
    assert_redirected_to_sign_in
  end

  test 'show scale mode' do
    FeatureModeManager.stubs(:get_mode).returns('scale')
    get :show
    assert_response :success
    assert_select '#scale[checked="checked"]'
  end

  test 'show normal mode' do
    FeatureModeManager.stubs(:get_mode).returns('normal')
    get :show
    assert_response :success
    assert_select '#normal[checked="checked"]'
  end

  test 'update scale mode and show pending scale mode' do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      FeatureModeManager.expects(:set_mode)
      post :update, params: {mode: 'scale'}
      assert_redirected_to 'http://test.host/admin/feature_mode'

      # Stub the feature mode manager to still return 'normal', simulating a change that has not yet
      # taken effect, and make sure the response page still indicates the pending 'scale' mode.
      FeatureModeManager.stubs(:get_mode).returns('normal')
      get :show
      assert_response :success
      assert_select '#scale[checked="checked"]'
    end

    # Advance time so that the pending change has expired, and verify that the show page goes
    # back to showing the value returned by the FeatureModeManager rather than pending value in the
    # session.
    Timecop.travel Time.local(2013, 9, 1, 12, 1, 0) do
      get :show
      assert_response :success
      assert_select '#normal[checked="checked"]'
    end
  end
end
