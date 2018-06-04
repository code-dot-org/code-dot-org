require 'test_helper'

class SharedBlocklyFunctionsControllerTest < ActionDispatch::IntegrationTest
  test 'can list shared functions' do
    get :index
    assert_response :success
  end
end
