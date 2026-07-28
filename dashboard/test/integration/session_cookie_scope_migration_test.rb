require 'test_helper'

# Integration coverage for Rack::SessionCookieScopeMigration through the full
# dashboard middleware stack, focused on the rollout's transition window.
#
# The migration ships in two deploys: first this middleware (while the session
# cookie is still `domain: :all`, so it lies dormant -- no duplicates exist
# yet), then the flip to host-only. Once flipped, a browser that already held
# the legacy domain-wide (.code.org) cookie also receives the new host-only
# cookie, so it sends BOTH under the same name in one request:
#
#     Cookie: _learn_session_test=<stale>; _learn_session_test=<fresh>
#
# Browsers order equal-path cookies oldest-first (RFC 6265 5.4) and Rack's
# parser is first-wins, so plain parsing reads the STALE cookie -- logging the
# user out and breaking CSRF. The middleware must instead read the fresh (last)
# cookie and expire the legacy copy.
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

  # The legacy Domain the middleware derives for the current host: the
  # registrable domain with a leading dot, matching what `domain: :all` set.
  def legacy_domain
    labels = host.split(':').first.split('.')
    ".#{labels.last(2).join('.')}"
  end

  def with_duplicate_cookies(first, last)
    get '/home', headers: {'HTTP_COOKIE' => "#{KEY}=#{first}; #{KEY}=#{last}"}
  end

  test 'stale wildcard cookie first, fresh cookie last: server reads the fresh session' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    # Stale (older, wildcard) cookie leads, as browsers order them. First-wins
    # parsing would read it and log the user out; keep-LAST reads `fresh`.
    with_duplicate_cookies('stale-nonsense', fresh)

    assert_equal user.id, signed_in_user_id, 'middleware should resolve the fresh (last) session'
    assert_response :success
  end

  test 'keep-LAST is deterministic: fresh first, stale last reads the stale (empty) session' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    # Inverted order proves the middleware takes the LAST occurrence
    # specifically, not merely "whichever cookie happens to be valid".
    with_duplicate_cookies(fresh, 'stale-nonsense')

    assert_nil signed_in_user_id, 'middleware should resolve the last (stale) cookie, so no user'
  end

  test 'duplicate session cookies emit a deletion for the legacy wildcard cookie' do
    user = create(:teacher)
    fresh = sign_in_for_real(user)

    with_duplicate_cookies('stale-nonsense', fresh)

    set_cookies = Array(response.headers['Set-Cookie']).flat_map {|h| h.split("\n")}
    deletion = set_cookies.find {|c| c.start_with?("#{KEY}=;")}
    assert deletion, "expected a deletion Set-Cookie for #{KEY}; got: #{set_cookies.inspect}"
    assert_includes deletion, "domain=#{legacy_domain}"
    assert_includes deletion, 'max-age=0'
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
