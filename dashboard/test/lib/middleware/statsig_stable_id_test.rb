require 'test_helper'

class StatsigStableIdTest < ActiveSupport::TestCase
  STORAGE_KEY = SharedConstants::STATSIG_STABLE_ID_KEY

  let(:app) {mock}
  let(:cookie_jar) {mock}
  let(:cookies) {{}}
  let(:env) {Rack::MockRequest.env_for('/')}
  let(:request) {mock}
  let(:response) {[200, {}, ['OK']]}
  let(:session) {{}}

  before do
    ActionDispatch::Request.stubs(:new).with(env).returns(request)
    app.expects(:call).with(env).returns(response)
    request.stubs(:cookie_jar).returns(cookie_jar)
    request.stubs(:cookies).returns(cookies)
    request.stubs(:onetrust_performance_cookies_allowed?).returns(true)
    request.stubs(:session).returns(session)
    request.stubs(:shared_cookie_domain).returns('code.org')
    CDO.stubs(:rack_env?).with(:development).returns(false)
  end

  it 'copies an existing cookie ID into the session' do
    cookie_id = SecureRandom.uuid
    cookies[STORAGE_KEY] = cookie_id
    session[STORAGE_KEY] = SecureRandom.uuid
    cookie_jar.expects(:[]=).never

    _(call_middleware).must_equal response
    _(session[STORAGE_KEY]).must_equal cookie_id
  end

  it 'copies an existing session ID into the cookie' do
    session_id = SecureRandom.uuid
    session[STORAGE_KEY] = session_id
    cookie_jar.expects(:[]=).with(
      STORAGE_KEY,
      {
        value: session_id,
        domain: 'code.org',
        path: '/',
        same_site: :lax,
        secure: true,
      }
    )

    call_middleware
  end

  it 'generates an ID when the cookie and session IDs are blank' do
    generated_id = SecureRandom.uuid
    cookies[STORAGE_KEY] = ''
    session[STORAGE_KEY] = ''
    Cdo::AnonUserId.expects(:generate).returns(generated_id)
    cookie_jar.expects(:[]=).with(STORAGE_KEY, has_entry(:value, generated_id))

    call_middleware

    _(session[STORAGE_KEY]).must_equal generated_id
  end

  it 'keeps the ID in the session and deletes the cookie without consent' do
    cookie_id = SecureRandom.uuid
    generated_id = SecureRandom.uuid
    cookies[STORAGE_KEY] = cookie_id
    request.stubs(:onetrust_performance_cookies_allowed?).returns(false)
    Cdo::AnonUserId.expects(:generate).returns(generated_id)
    cookie_jar.expects(:delete).with(STORAGE_KEY, domain: 'code.org', path: '/')

    call_middleware

    _(session[STORAGE_KEY]).must_equal generated_id
  end

  private def call_middleware
    Middleware::StatsigStableId.new(app).call(env)
  end
end
