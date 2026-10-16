require_relative '../../test_helper'
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
        assert_equal cookie_id, request.anon_user_id
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
        assert_equal stable_id, request.anon_user_id
        assert_equal stable_id, MockRequest.new(session).statsig_stable_id
      end
    end

    def test_anon_user_id_is_new_after_clear
      anon_user_id = Cdo::AnonUserId.generate
      cookies = {Cdo::AnonUserId::KEY => anon_user_id}
      session = {Cdo::AnonUserId::KEY => anon_user_id}
      cookie_jar = mock('cookie_jar')
      cookie_jar.expects(:delete).with(Cdo::AnonUserId::KEY, domain: :all)
      request = MockRequest.new(session)
      request.stubs(:cookies).returns(cookies)
      request.stubs(:cookie_jar).returns(cookie_jar)
      assert_equal anon_user_id, request.anon_user_id

      Cdo::AnonUserId.clear(request)
      refute cookies.key?(Cdo::AnonUserId::KEY)
      refute session.key?(Cdo::AnonUserId::KEY)

      new_id = request.anon_user_id
      assert_match Cdo::AnonUserId::FORMAT, new_id
      refute_equal anon_user_id, new_id
    end

    def test_existing_anon_user_id_returns_existing_statsig_stable_id
      session_id = SecureRandom.uuid
      session = {SharedConstants::STATSIG_STABLE_ID_KEY => session_id}
      session.expects(:[]=).never

      assert_equal session_id, MockRequest.new(session).existing_anon_user_id
    end

    def test_existing_anon_user_id_returns_nil_without_generating
      session = {}
      session.expects(:[]=).never

      assert_nil MockRequest.new(session).existing_anon_user_id
    end

    def test_anon_user_id_replaces_invalid_session_value
      request = MockRequest.new(SharedConstants::STATSIG_STABLE_ID_KEY => 'invalid')

      assert Cdo::AnonUserId.valid?(request.anon_user_id)
      assert_equal request.statsig_stable_id, request.anon_user_id
    end
  end
end
