require 'test_helper'

# Integration coverage for Rack::SessionCookieScopeMigration through the full
# dashboard middleware stack, exercising the CURRENT situation: the session
# cookie config is `domain: :all` (the test env's setting). After a brief
# `domain: nil` deploy, users who first appeared in that window hold a stale
# host-only cookie plus the fresh wildcard cookie the current config writes, so
# the browser sends BOTH under the same name in one request:
#
#     Cookie: _learn_session_test=<stale host-only>; _learn_session_test=<fresh wildcard>
#
# Browsers order equal-path cookies oldest-first (RFC 6265 5.4) and Rack's
# parser is first-wins, so plain parsing reads the STALE cookie -- logging the
# user out and breaking CSRF. The middleware must instead read the fresh (last)
# cookie and expire the stale one -- here the host-only cookie, since `:all`
# writes the wildcard.
#
# A real browser holding two same-name cookies cannot be reproduced through the
# single-valued integration cookie jar, so we forge the duplicate header
# directly. rack-test honours a caller-supplied header --
# `env['HTTP_COOKIE'] ||= cookie_jar.for(uri)` -- so a value passed via
# `headers:` wins over the jar.
#
# Note we use the real `POST /users/sign_in` flow rather than the Devise
# `sign_in` test helper: the latter injects the user via Warden test mode on
# every request, bypassing the very session-cookie resolution under test.
class SessionCookieScopeMigrationTest < ActionDispatch::IntegrationTest
  KEY = CDO.session_cookie_name # _learn_session_test

  # Sign in for real and return the fresh session cookie value.
  def sign_in_for_real(user)
    post '/users/sign_in', params: {user: {login: user.email, password: '00secret'}}
    assert_equal user.id, signed_in_user_id, 'precondition: real login should establish a session'
    fresh = cookies[KEY]
    assert fresh.present?, 'precondition: a session cookie should be set'
    fresh
  end

  def with_duplicate_cookies(first, last)
    get '/home', headers: {'HTTP_COOKIE' => "#{KEY}=#{first}; #{KEY}=#{last}"}
  end

  test 'stale cookie first, fresh cookie last: server reads the fresh session' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    # Stale (older, host-only) cookie leads, as browsers order them. First-wins
    # parsing would read it and log the user out; keep-LAST reads `fresh`.
    with_duplicate_cookies('stale-nonsense', fresh)

    assert_equal user.id, signed_in_user_id, 'middleware should resolve the fresh (last) session'
    # An authenticated teacher hitting /home 302-redirects to their dashboard;
    # an unauthenticated request would instead bounce to /users/sign_in. So
    # "not sent to sign-in" is the HTTP-level confirmation the fresh session was
    # read.
    refute_includes response.location.to_s, '/users/sign_in'
  end

  test 'keep-LAST is deterministic: fresh first, stale last reads the stale (empty) session' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    # Inverted order proves the middleware takes the LAST occurrence
    # specifically, not merely "whichever cookie happens to be valid".
    with_duplicate_cookies(fresh, 'stale-nonsense')

    assert_nil signed_in_user_id, 'middleware should resolve the last (stale) cookie, so no user'
  end

  test 'duplicate cookies under domain: :all expire the stale host-only cookie, not the wildcard' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    with_duplicate_cookies('stale-nonsense', fresh)

    set_cookies = Array(response.headers['Set-Cookie']).flat_map {|h| h.split("\n")}
    deletion = set_cookies.find {|c| c.start_with?("#{KEY}=;") && c.include?('max-age=0')}
    assert deletion, "expected a host-only deletion for #{KEY}; got: #{set_cookies.inspect}"
    # Under `:all` the current config writes the wildcard cookie, so the stale
    # duplicate is host-only: the deletion must carry NO Domain. A `domain=`
    # here would delete the good wildcard cookie the user just got.
    refute_includes deletion, 'domain='
  end

  test 'a single (not-yet-migrated) session cookie is left untouched' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    # Before the flip a browser holds only the one wildcard cookie: the
    # middleware must be a no-op -- no dedup, no deletion.
    get '/home', headers: {'HTTP_COOKIE' => "#{KEY}=#{fresh}"}

    assert_equal user.id, signed_in_user_id
    set_cookies = Array(response.headers['Set-Cookie']).flat_map {|h| h.split("\n")}
    assert_nil set_cookies.find {|c| c.start_with?("#{KEY}=;")}, 'should not emit a deletion for a lone cookie'
  end
end
