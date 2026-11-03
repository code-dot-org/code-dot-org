require_relative '../../test_helper'
require 'action_dispatch'
require 'action_dispatch/middleware/cookies'
require 'cdo/rack/request'

class RequestTest
  class RequestExtensionTest < Minitest::Test
    # Manually implement a subset of methods that RequestExtension expects the
    # Request class it's extending to define, so we can test our custom
    # functionality without needing a complete Request object.
    # See https://github.com/rack/rack/blob/v2.2.6.4/lib/rack/request.rb
    class MockRequest
      attr_reader :session

      def initialize(session = {})
        @session = session
      end

      def http_host_and_port(host, port)
        return host if port == 80
        "#{host}:#{port}"
      end

      def trusted_proxy?(ip)
        Rack::Request.ip_filter.call(ip)
      end

      def cookies
        {}
      end
    end
    MockRequest.prepend Cdo::RequestExtension

    def setup
      @mock_request = MockRequest.new
    end

    def test_trusted_proxies
      # Standard IP addresses and hostnames as used by the base Request
      # implementation still work as expected.
      assert @mock_request.trusted_proxy?('localhost')
      refute @mock_request.trusted_proxy?('93.184.215.14') # example.com

      # IP addresses within our custom set of trusted proxies should all be
      # trusted. This list is dynamic and automatically updated, so we sample
      # from it for testing rather than hardcoding anything.
      proxy_ranges = JSON.parse(File.read(deploy_dir('lib/cdo/trusted_proxies.json')))['ranges']
      proxy_ranges.sample(5).each do |proxy_range|
        proxy_ip = proxy_range.split('/').first
        message = "expected #{proxy_ip.inspect} to be trusted"
        assert @mock_request.trusted_proxy?(proxy_ip), message
      end
    end

    def test_referer_site_with_port
      # Returns actual referer if it's internal.
      @mock_request.stubs(:referer).returns('http://localhost-studio.code.org:3000/home')
      assert_equal 'localhost-studio.code.org:3000', @mock_request.referer_site_with_port
      @mock_request.stubs(:referer).returns('http://studio.code.org/home')
      assert_equal 'studio.code.org', @mock_request.referer_site_with_port
      @mock_request.stubs(:referer).returns('https://www.csedweek.org/')
      assert_equal 'www.csedweek.org:443', @mock_request.referer_site_with_port

      # Normalizes unrecognized or invalid referers to code.org.
      @mock_request.stubs(:referer).returns('https://example.com')
      assert_equal 'code.org', @mock_request.referer_site_with_port
      @mock_request.stubs(:referer).returns('not actually a valid URI')
      assert_equal 'code.org', @mock_request.referer_site_with_port
    end

    def test_site_from_host
      hosts_to_expected = {
        # "Base" domains and subdomains are returned unmodified
        'studio.code.org': 'studio.code.org',
        'code.org': 'code.org',
        'hourofcode.com': 'hourofcode.com',

        # Localhost- and environment-specific subdomains are normalized to the
        # "base".
        'localhost-studio.code.org': 'studio.code.org',
        'staging-studio.code.org': 'studio.code.org',
        'localhost.code.org': 'code.org',
        'test.code.org': 'code.org',
        'localhost.hourofcode.com': 'hourofcode.com',

        # The codeprojects domains (legacy Web Lab shares, and the sandboxed
        # preview origins for Web Lab 2 / Python Lab) are recognized by their
        # last two host parts.
        'codeprojects.org': 'codeprojects.org',
        'foo.preview.codeprojects.org': 'codeprojects.org',
        'foo.preview.codeaiprojects.org': 'codeaiprojects.org',

        # Entirely unrecognized domains are normalized to just code.org
        'example.com': 'code.org',
      }

      hosts_to_expected.each do |host, expected|
        @mock_request.stubs(:host).returns(host.to_s)
        message = "expected to get #{expected} when calling site_from_host with host #{host.inspect}"
        assert_equal expected, @mock_request.site_from_host, message
      end
    end

    def test_user_id_from_session_store
      mock_session_store = Minitest::Mock.new
      def mock_session_store.with; {}; end
      @mock_request.stubs(:dashboard_session_store).returns(mock_session_store)

      # defaults to nil
      assert_nil @mock_request.user_id_from_session_store

      # Will fetch user id from the session if it exists
      def mock_session_store.with; {'warden.user.user.key' => [['user_id']]}; end
      assert_equal 'user_id', @mock_request.user_id_from_session_store
    end

    def test_statsig_stable_id_persists_in_session_across_requests
      session = {}
      stable_id = MockRequest.new(session).statsig_stable_id

      assert_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io, stable_id
      assert_equal stable_id, MockRequest.new(session).statsig_stable_id
    end

    def test_statsig_stable_id_does_not_rewrite_existing_session_value
      stable_id = SecureRandom.uuid
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => stable_id}
      session.expects(:[]=).never

      assert_equal stable_id, MockRequest.new(session).statsig_stable_id
    end

    def test_statsig_stable_id_prefers_cookie_without_writing_session
      cookie_id = SecureRandom.uuid
      [nil, '', '<html>blocked</html>', SecureRandom.uuid].each do |session_id|
        session = {SharedConstants::STATSIG_STABLE_ID_KEY => session_id}
        session.expects(:[]=).never
        request = MockRequest.new(session)
        request.stubs(:cookies).returns(SharedConstants::STATSIG_STABLE_ID_KEY => cookie_id)

        assert_equal cookie_id, request.statsig_stable_id
        assert_equal session_id, session[SharedConstants::STATSIG_STABLE_ID_KEY]
      end
    end

    # Any access to the session would load it, and any write would create it in Redis.
    def test_statsig_stable_id_does_not_touch_session_for_valid_cookie
      cookie_id = SecureRandom.uuid
      request = MockRequest.new(mock('session'))
      request.stubs(:cookies).returns(SharedConstants::STATSIG_STABLE_ID_KEY => cookie_id)

      assert_equal cookie_id, request.statsig_stable_id
    end

    def test_existing_statsig_stable_id_prefers_cookie
      cookie_id = SecureRandom.uuid
      request = MockRequest.new(mock('session'))
      request.stubs(:cookies).returns(SharedConstants::STATSIG_STABLE_ID_KEY => cookie_id)

      assert_equal cookie_id, request.existing_statsig_stable_id
    end

    def test_existing_statsig_stable_id_falls_back_to_session
      session_id = SecureRandom.uuid
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => session_id}
      session.expects(:[]=).never
      request = MockRequest.new(session)
      request.stubs(:cookies).returns(SharedConstants::STATSIG_STABLE_ID_KEY => '<html>blocked</html>')

      assert_equal session_id, request.existing_statsig_stable_id
    end

    def test_existing_statsig_stable_id_returns_nil_without_generating
      [nil, '', 'invalid', 123, :invalid, [SecureRandom.uuid], {id: SecureRandom.uuid}].each do |invalid_id|
        session = {SharedConstants::STATSIG_STABLE_ID_KEY => invalid_id}
        session.expects(:[]=).never

        assert_nil MockRequest.new(session).existing_statsig_stable_id
      end
    end

    def test_statsig_stable_id_replaces_non_string_session_value
      [123, :invalid, [SecureRandom.uuid], {id: SecureRandom.uuid}].each do |invalid_id|
        session = {SharedConstants::STATSIG_STABLE_ID_KEY => invalid_id}

        stable_id = MockRequest.new(session).statsig_stable_id

        assert_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io, stable_id
        assert_equal stable_id, session[SharedConstants::STATSIG_STABLE_ID_KEY]
      end
    end

    def test_statsig_stable_id_is_stable_until_cleared
      stable_id = SecureRandom.uuid
      cookies = {SharedConstants::STATSIG_STABLE_ID_KEY => stable_id}
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => stable_id}
      request = MockRequest.new(session)
      request.stubs(:cookies).returns(cookies)

      assert_equal stable_id, request.statsig_stable_id
      cookies.delete(SharedConstants::STATSIG_STABLE_ID_KEY)
      session.delete(SharedConstants::STATSIG_STABLE_ID_KEY)
      new_stable_id = request.statsig_stable_id

      assert_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io, new_stable_id
      refute_equal stable_id, new_stable_id
      assert_equal new_stable_id, request.statsig_stable_id
    end

    def test_statsig_stable_id_uses_session_for_blank_cookie
      session_id = SecureRandom.uuid
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => session_id}
      request = MockRequest.new(session)
      request.stubs(:cookies).returns(SharedConstants::STATSIG_STABLE_ID_KEY => '')

      assert_equal session_id, request.statsig_stable_id
      assert_equal session_id, session[SharedConstants::STATSIG_STABLE_ID_KEY]
    end

    def test_statsig_stable_id_replaces_blank_session_value
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => ''}

      stable_id = MockRequest.new(session).statsig_stable_id

      assert_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io, stable_id
      assert_equal stable_id, session[SharedConstants::STATSIG_STABLE_ID_KEY]
    end

    def test_statsig_stable_id_uses_valid_session_for_invalid_cookie
      session_id = SecureRandom.uuid
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => session_id}
      request = MockRequest.new(session)
      request.stubs(:cookies).returns(SharedConstants::STATSIG_STABLE_ID_KEY => '<html>blocked</html>')
      session.expects(:[]=).never

      assert_equal session_id, request.statsig_stable_id
    end

    def test_statsig_stable_id_replaces_invalid_cookie_and_session
      storage_key = SharedConstants::STATSIG_STABLE_ID_KEY
      [nil, '', '<html>blocked</html>', '0b26deae-cf8e-1af3-8b03-4534de3b781f', "#{SecureRandom.uuid}\n"].each do |invalid_id|
        session = {storage_key => invalid_id}
        request = MockRequest.new(session)
        request.stubs(:cookies).returns(storage_key => invalid_id)

        stable_id = request.statsig_stable_id

        assert_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io, stable_id
        assert_equal stable_id, session[storage_key]
        assert_equal stable_id, MockRequest.new(session).statsig_stable_id
      end
    end
  end
end

describe Cdo::RequestExtension do
  describe '#anon_user_id' do
    let(:anon_user_id) {request.anon_user_id}
    let(:request) {Rack::Request.new(Rack::MockRequest.env_for(url, 'HTTP_COOKIE' => cookie_header))}
    let(:url) {'https://studio.code.org/'}
    let(:cookie_header) {cookies.map {|key, value| "#{key}=#{value}"}.join('; ')}
    let(:cookies) {{}}

    # The header ActionDispatch::Cookies would write to the response.
    def set_cookie_header
      response = Rack::Response.new
      ActionDispatch::Request.new(request.env).cookie_jar.write(response)
      response['Set-Cookie']
    end

    it 'generates UUID v4' do
      _(anon_user_id).must_match Cdo::AnonUserId::FORMAT
    end

    it 'sets session cookie' do
      anon_user_id

      _(set_cookie_header).must_equal "#{Cdo::AnonUserId::KEY}=#{anon_user_id}; domain=code.org; path=/; secure; HttpOnly; SameSite=Lax"
    end

    it 'sets cookie without expiry' do
      anon_user_id

      _(set_cookie_header).wont_match(/expires=|max-age=/i)
    end

    it 'returns same ID for rest of request' do
      _(request.anon_user_id).must_equal anon_user_id
      _(Rack::Request.new(request.env).anon_user_id).must_equal anon_user_id
      _(set_cookie_header.scan(Cdo::AnonUserId::KEY).size).must_equal 1
    end

    # Writing the session would create it in Redis.
    it 'does not write session' do
      session = {}
      session.expects(:[]=).never
      request.env['rack.session'] = session

      _(anon_user_id).must_match Cdo::AnonUserId::FORMAT
    end

    context 'over HTTP' do
      let(:url) {'http://studio.code.org/'}

      it 'sets cookie without secure flag' do
        anon_user_id

        _(set_cookie_header).must_equal "#{Cdo::AnonUserId::KEY}=#{anon_user_id}; domain=code.org; path=/; HttpOnly; SameSite=Lax"
      end
    end

    context 'with ActionDispatch request' do
      let(:request) {ActionDispatch::Request.new(Rack::MockRequest.env_for(url))}

      it 'sets cookie in controller cookie jar' do
        anon_user_id

        _(request.cookie_jar[Cdo::AnonUserId::KEY]).must_equal anon_user_id
      end
    end

    context 'when anon_user_id cookie exists' do
      let(:existing_anon_user_id) {Cdo::AnonUserId.generate}
      let(:cookies) {{Cdo::AnonUserId::KEY => existing_anon_user_id}}

      it 'returns cookie value' do
        _(anon_user_id).must_equal existing_anon_user_id
      end

      it 'does not set cookie' do
        anon_user_id

        _(set_cookie_header).must_be_nil
      end

      # Any access to the session would load it from Redis.
      it 'does not touch session' do
        request.env['rack.session'] = mock('session')

        _(anon_user_id).must_equal existing_anon_user_id
      end

      context 'with Statsig stable ID cookie' do
        let(:cookies) {{Cdo::AnonUserId::KEY => existing_anon_user_id, SharedConstants::STATSIG_STABLE_ID_KEY => SecureRandom.uuid}}

        it 'prefers anon_user_id cookie' do
          _(anon_user_id).must_equal existing_anon_user_id
        end
      end
    end

    ['', 'invalid', "#{Cdo::AnonUserId.generate}\n"].each do |invalid_id|
      context "when anon_user_id cookie is #{invalid_id.inspect}" do
        let(:cookies) {{Cdo::AnonUserId::KEY => invalid_id}}

        it 'replaces it' do
          _(anon_user_id).must_match Cdo::AnonUserId::FORMAT
          _(set_cookie_header).must_include "#{Cdo::AnonUserId::KEY}=#{anon_user_id};"
        end
      end
    end

    context 'when Statsig stable ID cookie exists' do
      let(:stable_id) {SecureRandom.uuid}
      let(:cookies) {{SharedConstants::STATSIG_STABLE_ID_KEY => stable_id}}

      it 'reuses Statsig stable ID' do
        _(anon_user_id).must_equal stable_id
        _(set_cookie_header).must_include "#{Cdo::AnonUserId::KEY}=#{stable_id};"
      end
    end

    context 'when Statsig stable ID is in session' do
      let(:stable_id) {SecureRandom.uuid}
      let(:session) {{SharedConstants::STATSIG_STABLE_ID_KEY => stable_id}}

      before do
        request.env['rack.session'] = session
      end

      it 'reuses Statsig stable ID' do
        _(anon_user_id).must_equal stable_id
        _(set_cookie_header).must_include "#{Cdo::AnonUserId::KEY}=#{stable_id};"
      end

      it 'does not write session' do
        session.expects(:[]=).never

        _(anon_user_id).must_equal stable_id
      end
    end

    context 'when Statsig stable ID is invalid' do
      let(:invalid_id) {'<html>blocked</html>'}
      let(:cookies) {{SharedConstants::STATSIG_STABLE_ID_KEY => invalid_id}}

      before do
        request.env['rack.session'] = {SharedConstants::STATSIG_STABLE_ID_KEY => invalid_id}
      end

      it 'generates new ID' do
        _(anon_user_id).must_match Cdo::AnonUserId::FORMAT
        _(anon_user_id).wont_equal invalid_id
      end
    end
  end
end
