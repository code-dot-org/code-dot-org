require 'minitest/autorun'
require 'rack/test'
ENV['RACK_ENV'] = 'test'
require_relative '../../deployment'
require 'cdo/rack/allowlist'

require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'

module Cdo
  module RackMockServer
    module RackTest
      def setup
        @mock_responses = []
      end

      include Rack::Test::Methods
      def build_rack_mock_session
        @session ||= Rack::MockSession.new(app, 'localhost.code.org')
      end

      def mock_app
        lambda do |env|
          @request = Rack::Request.new(env)
          @request_cookies = @request.cookies
          @request_env = env
          match = best_response(@request, env)
          if match
            url = match[:url]
            (@origin_requests ||= {})[url] = (@origin_requests[url] || 0) + 1
            [200, ({
              'Cache-Control' => 'public, max-age=10',
              'Content-Type' => 'text/plain'
            }.merge(match[:response])), match[:body]]
          else
            [404, {'Content-Type' => 'text/plain'}, ['Not found']]
          end
        end
      end

      # Returns a mock response with matching url, method
      # and greatest number of matching request headers.
      def best_response(request, env)
        responses = @mock_responses.select do |response|
          request.path_info == response[:url] &&
            request.request_method == response[:method] &&
            response[:request].all? {|name, value| env["HTTP_#{name.upcase.tr('-', '_')}"] == value}
        end
        responses.max_by {|r| r[:request].length}
      end

      def app
        mock = mock_app
        Rack::Builder.app do
          use Rack::Allowlist::Downstream,
            HttpCache.config(rack_env)[:dashboard]

          require 'rack/cache'
          use Rack::Cache, ignore_headers: []
          use Rack::Allowlist::Upstream,
            HttpCache.config(rack_env)[:dashboard]
          run(mock)
        end
      end
    end

    # The methods in this module are used for the shared http cache test suite
    # located in cookbooks/cdo-varnish/test/shared/shared.rb.
    # Keep in sync with Cdo::MockServer::Helpers.
    module Helpers
      include RackTest

      # Stub
      def init(*_)
      end

      # Builds a URL with the provided prefix/suffix and a
      # universally unique identifier to ensure cache-freshness.
      def build_url(prefix='x', suffix='')
        id = SecureRandom.uuid
        "/#{prefix}/#{id}/#{suffix}"
      end

      # Mocks a simple text/plain response body at the specified URL.
      def mock_response(url, body, request_headers={}, response_headers={}, method='GET')
        @mock_responses.push(
          {
            url: url,
            body: body,
            request: request_headers,
            response: response_headers,
            method: method
          }
        )
      end

      def proxy_request(url, headers={}, cookies={}, method='GET')
        headers.each do |name, value|
          header name, value
        end
        session = build_rack_mock_session
        cookies.each do |key, value|
          session.set_cookie("#{key}=#{value}", URI.parse(url))
        end
        request url, method: method
      end

      def local_request(url, headers={}, cookies={})
        session = Rack::MockSession.new(mock_app, 'localhost.code.org')
        headers.each do |name, value|
          session.header name, value
        end
        cookies.each do |key, value|
          session.set_cookie("#{key}=#{value}", URI.parse(url))
        end
        Rack::Test::Session.new(session).get(url)
      end

      def code(response)
        response.status
      end

      def assert_ok(response)
        assert_equal 200, code(response)
      end

      def assert_miss(response)
        assert_rack_cache response, false
      end

      def assert_hit(response)
        assert_rack_cache response, true
      end

      def assert_rack_cache(response, hit)
        assert_match hit ? /fresh/ : /miss/, response.headers['X-Rack-Cache']
      end

      def count_origin_requests(url)
        @origin_requests[url]
      end

      def last_line(response)
        response.body
      end

      def get_header(response, header)
        response.headers[header]
      end
    end
  end
end

# Load the shared http-cache test suite from the cdo-varnish cookbook.
require_relative '../../cookbooks/cdo-varnish/test/shared/shared'
HttpCacheTest.setup(rack_env, Cdo::RackMockServer::Helpers)
