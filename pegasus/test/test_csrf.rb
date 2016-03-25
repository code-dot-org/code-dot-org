require 'sinatra'
require_relative '../src/env'
require_relative '../router'
require 'rack/csrf'
require 'rack/test'
require 'minitest/autorun'
require 'mocha/mini_test'
require 'webmock/minitest'

# Test for the router CSRF logic.
class CsrfTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_poste_send_message_csrf
    # Pretend to be an admin user
    fake_admin = FakeAdminUserHelper.new
    ::Documents.any_instance.stubs(:dashboard_user_helper).returns(fake_admin)

    # Make sure that a post without the CSRF token is denied
    header 'host', 'code.org'
    params = {
      template: '2-11-recruitment-dallas',
      recipients: 'example@example.com'
    }
    response = post('/v2/poste/send-message', params)
    assert_equal 403, response.status

    # Set a fake CSR token in the environment and verify a post with that
    # token succeeds.
    fake_csrf_token = 'fake_token'
    fake_session = {Rack::Csrf.key => fake_csrf_token}
    params_with_token = params.merge(_csrf: fake_csrf_token)
    response = post('/v2/poste/send-message',
                    params_with_token,
                    {'rack.session' => fake_session})
    assert_equal 200, response.status
  end
end

# A fake dashboard user helper which always claims to be an admin.
class FakeAdminUserHelper
  def admin?
    true
  end
end
