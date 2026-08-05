require 'test_helper'

# Integration coverage for Rack::SessionCookieScopeMigration through the full
# dashboard stack -- the middleware, Rack's cookie parsing, and the
# RedisSessionStore -- not just the middleware in isolation (see
# lib/test/cdo/rack/test_session_cookie_scope_migration.rb for that).
class SessionCookieScopeMigrationTest < ActionDispatch::IntegrationTest
  KEY = Rails.application.config.session_options[:key] # _learn_session_test
  BOGUS = 'I_AM_NOT_A_VALID_SESSION_ID'.freeze

  # Fetch a real, valid session id freshly issued by Rails.
  def real_session_id
    get '/users/sign_in'
    id = cookies[KEY].presence
    assert id, "precondition: Rails should issue a #{KEY} cookie"
    id
  end

  # The session id in play after the last request. Jar-backed, so it retains the
  # prior value if Rails re-emits nothing (an unchanged, recognized session).
  def current_session_id
    cookies[KEY].presence
  end

  def get_with_cookies(*values)
    get '/users/sign_in', headers: {'HTTP_COOKIE' => values.map {|v| "#{KEY}=#{v}"}.join('; ')}
  end

  test 'bogus cookie first, real cookie last: server reads the real (last) one' do
    real = real_session_id

    get_with_cookies(BOGUS, real)

    # Rails recognized the real (last) id and kept it -- rather than reading the
    # bogus first cookie and minting a fresh session.
    assert_equal real, current_session_id, 'should keep the real (last) session id'
  end

  test 'real cookie first, bogus cookie last: server reads the bogus (last) one' do
    real = real_session_id

    get_with_cookies(real, BOGUS)

    # Rails read the bogus (last) id, could not find it, and minted a new one --
    # proving it reads the LAST cookie, not merely "whichever one is valid".
    refute_equal real, current_session_id, 'should read the bogus (last) id and mint a new one'
  end
end
