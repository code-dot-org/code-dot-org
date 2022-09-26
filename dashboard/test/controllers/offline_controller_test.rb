require 'test_helper'

class OfflineControllerTest < ActionController::TestCase
  test "basic offline_files functionality" do
    get :offline_files
    assert_response :success
    response_data = JSON.parse(response.body)
    assert_equal response_data.keys, ['files']
  end
end
