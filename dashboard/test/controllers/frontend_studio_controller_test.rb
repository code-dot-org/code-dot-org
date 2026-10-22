require 'test_helper'

class FrontendStudioControllerTest < ActionController::TestCase
  # The rendering tests stub the one tag that needs a built studio package, so
  # these tests pass with or without one on this machine. They cannot be
  # integration tests: the Vite dev server proxy answers
  # /frontend-studio/assets/* before routing.

  setup do
    ActionView::Base.any_instance.stubs(:vite_typescript_tag).returns('')
  end

  # A flash set by an earlier request reaches this one through the session.
  def session_with_flash(**flashes)
    {'flash' => ActionDispatch::Flash::FlashHash.new(flashes).to_session_value}
  end

  def page_flash
    meta = css_select('meta[name="page-flash"]')
    meta.empty? ? nil : JSON.parse(meta.first['content'])
  end

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

  test 'index should stamp notice, info and alert in that order' do
    DCDO.set('frontend_studio_enabled', true)

    get :index, session: session_with_flash(alert: 'Failed', notice: 'Linked', info: 'FYI')

    assert_response :success
    assert_equal [
      {'type' => 'notice', 'message' => 'Linked'},
      {'type' => 'info', 'message' => 'FYI'},
      {'type' => 'alert', 'message' => 'Failed'},
    ], page_flash
  end

  test 'index should omit the page-flash meta without a flash' do
    DCDO.set('frontend_studio_enabled', true)

    get :index

    assert_response :success
    assert_nil page_flash
  end

  test 'index should escape a message so it parses back to the original' do
    DCDO.set('frontend_studio_enabled', true)
    message = 'Tom & "Jerry" <b>'

    get :index, session: session_with_flash(notice: message)

    assert_equal [{'type' => 'notice', 'message' => message}], page_flash
  end

  test 'index should keep the flash for one more request if keep_flashes is set' do
    DCDO.set('frontend_studio_enabled', true)

    get :index, session: session_with_flash(notice: 'Linked').merge('keep_flashes' => true)

    assert_equal false, session[:keep_flashes]

    get :index

    assert_equal [{'type' => 'notice', 'message' => 'Linked'}], page_flash
  end

  test 'index should sweep the flash if keep_flashes is unset' do
    DCDO.set('frontend_studio_enabled', true)

    get :index, session: session_with_flash(notice: 'Linked')

    assert_equal [{'type' => 'notice', 'message' => 'Linked'}], page_flash

    get :index

    assert_nil page_flash
  end
end
