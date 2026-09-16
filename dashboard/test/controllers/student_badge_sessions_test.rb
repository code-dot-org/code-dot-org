require 'test_helper'
require 'middleware/student_badge_sessions'

class StudentBadgeSessionsTest < ActiveSupport::TestCase
  setup do
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(true)
    @app = mock('downstream Rails or legacy API')
    @middleware = Middleware::StudentBadgeSessions.new(@app)
    @session = {'student_badge' => {'generation' => 1}, 'warden.user.user.key' => [[123], 'salt']}
    @env = {'rack.session' => @session, 'rack.session.options' => {}, 'REQUEST_METHOD' => 'POST'}
  end

  test 'revoked badge stops legacy API before it can use the session' do
    Services::StudentBadges::Session.expects(:valid?).with(@session).returns(false)
    @app.expects(:call).never
    status, headers, = @middleware.call(@env)
    assert_equal 401, status
    assert_equal 'no-store', headers['Cache-Control']
    assert_empty @session
    assert @env['rack.session.options'][:renew]
  end

  test 'expired browser navigation goes to scanner' do
    Services::StudentBadges::Session.stubs(:valid?).returns(false)
    @env['REQUEST_METHOD'] = 'GET'
    @env['HTTP_ACCEPT'] = 'text/html'
    status, headers, = @middleware.call(@env)
    assert_equal 303, status
    assert_equal '/badge_login', headers['Location']
  end

  test 'emergency shutdown sends browser navigation to existing login' do
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(false)
    Services::StudentBadges::Session.stubs(:valid?).returns(false)
    @env['REQUEST_METHOD'] = 'GET'
    @env['HTTP_ACCEPT'] = 'text/html'
    _, headers, = @middleware.call(@env)
    assert_equal '/users/sign_in', headers['Location']
  end

  test 'valid badge marks the request and prohibits caching' do
    Services::StudentBadges::Session.stubs(:valid?).returns(true)
    @app.expects(:call).with(@env).returns([200, {}, ['ok']])
    status, headers, = @middleware.call(@env)
    assert_equal 200, status
    assert @env['cdo.badge_verified']
    assert_equal 'no-store', headers['Cache-Control']
  end

  test 'non-badge session is unaffected by emergency shutdown' do
    @session.delete('student_badge')
    Services::StudentBadges::Session.expects(:valid?).never
    @app.expects(:call).with(@env).returns([200, {}, ['ok']])
    assert_equal [200, {}, ['ok']], @middleware.call(@env)
    assert @session['warden.user.user.key']
  end

  test 'direct Redis session reader refuses unvalidated badge identity' do
    request = Rack::Request.new(Rack::MockRequest.env_for('/v3/channels'))
    store = mock('session store')
    store.stubs(:with).returns(@session)
    request.stubs(:dashboard_session_store).returns(store)
    Services::StudentBadges::Session.expects(:valid?).with(@session).returns(false)
    assert_nil request.user_id_from_session_store
  end

  test 'legacy reader uses the validation already performed by middleware' do
    request = Rack::Request.new(Rack::MockRequest.env_for('/v3/channels').merge('cdo.badge_verified' => true))
    store = mock('session store')
    store.stubs(:with).returns(@session)
    request.stubs(:dashboard_session_store).returns(store)
    Services::StudentBadges::Session.expects(:valid?).never
    assert_equal 123, request.user_id_from_session_store
  end
end
