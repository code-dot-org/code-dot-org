require 'test_helper'

class FrontendStudioControllerTest < ActionController::TestCase
  # Only the branches that answer without rendering are covered here, so these
  # tests pass whether or not a studio package is present on this machine.
  # These cannot be integration tests: in development and test the Vite dev
  # server proxy middleware answers /frontend-studio/assets/* before routing.

  test 'index is not found when the DCDO flag is off' do
    DCDO.set('frontend_studio_enabled', false)

    get :index

    assert_response :not_found
  end

  test 'index is not found for an assets path' do
    DCDO.set('frontend_studio_enabled', true)

    # format is html because the route declares format: false, so the whole
    # path including the extension lands in :path.
    get :index, params: {path: 'assets/app-abc123.js', format: :html}

    assert_response :not_found
  end

  test 'index is not found for a file Vite copies to the package root' do
    DCDO.set('frontend_studio_enabled', true)

    get :index, params: {path: 'favicon.svg', format: :html}

    assert_response :not_found
  end
end
