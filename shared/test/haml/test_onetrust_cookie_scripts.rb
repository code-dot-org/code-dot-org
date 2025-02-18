require_relative '../test_helper'
require 'action_view'
require 'haml'
require 'haml/template'
require 'haml/engine'
require 'ostruct'

class OnetrustCookieScriptsTest < ActionView::TestCase
  CODE_DOMAIN = 'code.org'
  HOC_DOMAIN = 'hourofcode.com'

  setup do
    DCDO.stubs(:get).with('onetrust_cookie_scripts', nil).returns(nil)
    @view_paths_backup = ActionController::Base.view_paths
    ActionController::Base.prepend_view_path(File.join(__dir__, '../../haml'))
  end

  teardown do
    ActionController::Base.view_paths = @view_paths_backu
    DCDO.unstub(:get)
  end

  test 'code.org does not render OneTrust scripts' do
    html = render_onetrust_cookie_scripts(CODE_DOMAIN, 'off')
    assert_equal "", html
  end

  test 'code.org renders OneTrust test scripts' do
    html = render_onetrust_cookie_scripts(CODE_DOMAIN, 'test')
    assert_match /977d-test\/OtAutoBlock\.js/, html
    assert_match /otSDKStub\.js/, html
    assert_match "function OptanonWrapper() { }", html
  end

  test 'code.org renders OneTrust prod scripts' do
    html = render_onetrust_cookie_scripts(CODE_DOMAIN)
    assert_match /977d\/OtAutoBlock\.js/, html
    assert_match /otSDKStub\.js/, html
    assert_match "function OptanonWrapper() { }", html
  end

  test 'hourofcode.com does not render OneTrust scripts' do
    html = render_onetrust_cookie_scripts(HOC_DOMAIN, 'off')
    assert_equal "", html
  end

  test 'hourofcode.com renders OneTrust test scripts' do
    html = render_onetrust_cookie_scripts(HOC_DOMAIN, 'test')
    assert_match /e345-test\/OtAutoBlock\.js/, html
    assert_match /otSDKStub\.js/, html
    assert_match "function OptanonWrapper() { }", html
  end

  test 'hourofcode.com renders OneTrust prod scripts' do
    html = render_onetrust_cookie_scripts(HOC_DOMAIN)
    assert_match /e345\/OtAutoBlock\.js/, html
    assert_match /otSDKStub\.js/, html
    assert_match "function OptanonWrapper() { }", html
  end

  def render_onetrust_cookie_scripts(domain, flag = nil)
    # local variables available to the HAML template
    locals = {
      request: mock_request({'onetrust_cookie_scripts' => flag}),
      domain: domain
    }
    render template: 'onetrust_cookie_scripts', locals: locals
  end

  # Creates a mock Request object which HAML files usually have access to.
  def mock_request(params = {}, cookies = {})
    OpenStruct.new(
      params: params,
      cookies: cookies,
    )
  end
end
