require 'test_helper'

class FrontendStudioControllerTest < ActionController::TestCase
  # Only the branches that answer without rendering are covered here, so these
  # tests pass whether or not a studio package is present on this machine.

  test 'index is not found when the DCDO flag is off' do
    DCDO.set('frontend_studio_enabled', false)

    get :index

    assert_response :not_found
  end

  test 'index is not found for an assets path' do
    DCDO.set('frontend_studio_enabled', true)

    get :index, params: {path: 'assets/index-abc123.js'}

    assert_response :not_found
  end
end
