require 'test_helper'

class TrackingPixelControllerTest < ActionController::TestCase
  test "get index" do
    get :index, params: {from: '/csf-18/pre-express/11/'}
    assert_response :success
  end
end
