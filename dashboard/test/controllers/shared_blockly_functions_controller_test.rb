require 'test_helper'

class SharedBlocklyFunctionsControllerTest < ActionController::TestCase
  setup do
    @levelbuilder = create(:levelbuilder)
  end

  test 'can list shared functions' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    get :index
    assert_response :success
  end
end
