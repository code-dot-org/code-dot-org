require 'test_helper'

# Integration coverage for Rack::SessionCookieScopeMigration through the full
# dashboard stack (the middleware, Rack's cookie parsing, and the session
# store), complementing the isolated middleware unit test.
#
# Rails keeps a session id it recognizes but mints a new one for an unknown id,
# so `session.id` tells us which of two same-name cookies the server actually
# read once the middleware has collapsed the duplicates.
class SessionCookieScopeMigrationTest < ActionDispatch::IntegrationTest
  KEY = Rails.application.config.session_options[:key] # _learn_session_test
  BOGUS = 'I_AM_NOT_A_VALID_SESSION_ID'.freeze

  # A raw Cookie header carrying the given values under the session cookie name.
  def cookie_header_with_sessions(*values)
    {'HTTP_COOKIE' => values.map {|value| "#{KEY}=#{value}"}.join('; ')}
  end

  test 'reads the newer session when the stale cookie is sent first' do
    get '/'
    session_id = session.id.to_s
    assert session_id.present?, 'precondition: the request should establish a session'

    get '/', headers: cookie_header_with_sessions(BOGUS, session_id)

    assert_equal session_id, session.id.to_s,
      'kept the valid (last) session id rather than the bogus (first) one'
  end

  # Ensure the last (newest) cookie wins. The test above would also pass for an implementation
  # that reads the FIRST cookie and falls back to the second only when the first is invalid.
  test 'reads the last cookie even when the earlier one is the valid session' do
    get '/'
    valid_session_id = session.id.to_s

    get '/', headers: cookie_header_with_sessions(valid_session_id, BOGUS)

    refute_equal valid_session_id, session.id.to_s,
      'read the bogus (last) cookie, so Rails minted a new session'
  end
end
