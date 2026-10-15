require 'test_helper'

class FrontendStudioControllerTest < ActionController::TestCase
  # Only the branches that answer without rendering, so these tests pass with or
  # without a studio package on this machine. They cannot be integration tests:
  # the Vite dev server proxy answers /frontend-studio/assets/* before routing.

  test 'index is not found when the feature flag is off' do
    DCDO.set('frontend_studio_enabled', false)

    get :index

    assert_response :not_found
  end

  test 'index is not found for an assets path' do
    DCDO.set('frontend_studio_enabled', true)

    # format: false puts the whole path, extension included, in :path.
    get :index, params: {path: 'assets/app-abc123.js', format: :html}

    assert_response :not_found
  end

  test 'index is not found for a file Vite copies to the package root' do
    DCDO.set('frontend_studio_enabled', true)

    get :index, params: {path: 'favicon.svg', format: :html}

    assert_response :not_found
  end
end
