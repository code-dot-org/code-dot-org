require 'test_helper'

class PoolsControllerTest < ActionController::TestCase
  test 'can list pools' do
    get :index
    assert_response :success
  end
end
