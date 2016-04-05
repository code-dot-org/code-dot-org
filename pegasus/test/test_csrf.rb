require 'sinatra'
require_relative '../src/env'
require_relative '../router'
require 'rack/csrf'
require 'rack/test'
require 'minitest/autorun'
require 'mocha/mini_test'
require 'webmock/minitest'

FAKE_CSRF_TOKEN = 'fake_token'

# Test for the router CSRF logic.
class CsrfTest < Minitest::Test
  include Rack::Test::Methods

  def with_role(role)
    Documents.any_instance.stubs(:dashboard_user_id).returns(role.nil? ? nil : role[:id])
  end

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_poste_send_message_without_csrf_token
    puts "WITHOUT TOKEN"
    as_admin_user
    header 'host', 'code.org'
    params = {
      template: '2-11-recruitment-dallas',
      recipients: 'example@example.com'
    }
    response = post('/v2/poste/send-message', params)
    assert_equal 403, response.status
  end

  def test_poste_send_message_with_csrf_token
    as_admin_user
    env = {'rack.session' => session_with_csrf_token}
    params_with_token = {
      template: '2-11-recruitment-dallas',
      recipients: 'example@example.com',
      _csrf: FAKE_CSRF_TOKEN
    }
    response = post('/v2/poste/send-message', params_with_token, env)
    assert_equal 200, response.status
  end

  def set_xhr_headers
    header 'host', 'code.org'
    header 'X-REQUESTED-WITH', 'XMLHttpRequest'
    header 'Content-Type', 'application/json; charset=utf-8'
  end

  def test_section_api_reject_requests_without_csrf_token
    as_admin_user
    set_xhr_headers
    env = {}
    response = post('/v2/sections', '{}', env)
    assert_equal 403, response.status
  end

  def test_section_api_reject_requests_with_invalid_csrf_token
    as_admin_user
    set_xhr_headers
    header 'X-CSRF-TOKEN', 'bad_token'
    env = {'rack.session' => session_with_csrf_token}
    response = post('/v2/sections', '{}', env)
    assert_equal 403, response.status
  end

  def test_section_api_csrf_with_valid_csrf_token
    set_xhr_headers
    header 'X-CSRF-TOKEN', FAKE_CSRF_TOKEN
    env = {'rack.session' => session_with_csrf_token}
    DashboardSection.stubs(:create).returns(1)
    response = post('/v2/sections', '{}', env)
    assert_equal 302, response.status
  end
end

def session_with_csrf_token
  {Rack::Csrf.key => FAKE_CSRF_TOKEN}
end

# Stubs the Pegasus app to pretend that an admin is logged in.
def as_admin_user
  ::Documents.any_instance.stubs(:dashboard_user_helper).returns(FakeAdminUserHelper.new)
end

# A fake dashboard user helper which always claims to be an admin.
class FakeAdminUserHelper
  def admin?
    true
  end
end
