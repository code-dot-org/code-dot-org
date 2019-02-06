require 'test_helper'

class BlocksControllerTest < ActionController::TestCase
  setup do
    @levelbuilder = create(:levelbuilder)
  end

  test 'can list shared functions' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    get :index, params: {pool: :pool}
    assert_response :success
  end
end
