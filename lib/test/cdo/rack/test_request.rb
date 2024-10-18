require_relative '../../test_helper'
require 'cdo/rack/request'

class RequestTest
  class RequestExtensionTest < Minitest::Test
    # Manually implement a subset of methods that RequestExtension expects the
    # Request class it's extending to define, so we can test our custom
    # functionality without needing a complete Request object.
    # See https://github.com/rack/rack/blob/v2.2.6.4/lib/rack/request.rb
    class MockRequest
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
      @mock_request.stubs(:referer).returns('http://studio.code.org.localhost:3000/home')
      assert_equal 'studio.code.org.localhost:3000', @mock_request.referer_site_with_port
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
        'studio.code.org.localhost': 'studio.code.org',
        'staging-studio.code.org': 'studio.code.org',
        'code.org.localhost': 'code.org',
        'test.code.org': 'code.org',
        'hourofcode.com.localhost': 'hourofcode.com',

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
  end
end
