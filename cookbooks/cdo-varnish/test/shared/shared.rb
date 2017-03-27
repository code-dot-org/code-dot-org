# Chef proxy-cache integration test implementation.
# The tests below are shared by both the Varnish-only (`default`) and the
# CloudFront + Varnish (`cloudfront`) integration test suites.
# This allows testing common proxy-cache behavior without duplication.

require 'minitest/unit'
require 'minitest/spec'
require 'minitest/mock'
require 'json'
require 'securerandom'
require 'uri/common'
require 'etc'

puts "Cloudfront: #{$cloudfront}"
# Setup the mock-server and ngrok
module Cdo
  module MockServer
    # Chef node attributes as constants
    DASHBOARD_PORT = 8080
    VARNISH_PORT = 80
    LOCALHOST = 'localhost'.freeze

    def self.setup(cloudfront=false)
      puts 'setup'
      user = Etc.getlogin
      home = Etc.getpwnam(user).dir
      ngrok_pid = cloudfront && spawn("/usr/local/ngrok/ngrok start cdo --config=#{home}/.ngrok2/ngrok.yml --log=stdout")
      pid = spawn('cd ~; java -jar mock.jar --verbose')
      # Don't start tests until wiremock is live.
      mock_started = false
      until mock_started
        `sleep 1`
        puts 'testing mock'
        `curl -s -i #{LOCALHOST}:#{DASHBOARD_PORT}/start`
        mock_started = $?.exitstatus == 0
      end
      `curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/mappings/new -d '#{{request: {method: 'GET', url: '/'}, response: {status: 200}}.to_json}'`
      `sleep 1` until system("curl -sf #{LOCALHOST}:#{VARNISH_PORT}/health_check.dashboard")
      puts 'setup finished'
      [pid, ngrok_pid]
    end

    def self.teardown(pid, ngrok_pid=nil)
      puts 'teardown'
      `curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/shutdown`
      Process.wait pid
      if ngrok_pid
        `kill -INT #{ngrok_pid}`
        Process.wait ngrok_pid
      end
      puts 'teardown finished'
    end

    module Helpers
      def init(cloudfront=false, environment=:integration)
        @cloudfront = cloudfront
        if cloudfront
          @proxy_host = 'cdo.ngrok.io'
          @proxy_address = "https://#{environment}-studio.code.org"
        else
          @proxy_host = "#{environment}-studio.code.org"
          @proxy_address = "#{LOCALHOST}:#{VARNISH_PORT}"
        end
      end

      # Returns the number of times the specified URL missed all proxy caches and was served by the mock server.
      def count_origin_requests(url)
        request = {method: 'GET', url: url}.to_json
        JSON.parse(`curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/requests/count -d '#{request}'`)['count']
      end

      # Mocks a simple text/plain response body at the specified URL.
      def mock_response(url, body, request_headers={}, response_headers={}, method='GET')
        json = {
          request: {
            method: method,
            url: url,
            headers: Hash[*request_headers.map {|k, v| [k, {equalTo: v}]}.flatten]
          },
          response: {
            status: 200,
            body: body,
            headers: {
              'Cache-Control' => 'public, max-age=10',
              'Content-Type' => 'text/plain'
            }.merge(response_headers)
          }
        }.to_json
        `curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/mappings/new -d '#{json}'`
      end

      # URI-escape helper for cookie keys/values.
      def escape(s)
        URI.encode_www_form_component s
      end

      def _request(url, headers={}, cookies={}, method='GET')
        header_string = headers.map {|key, value| "-H \"#{key}: #{value}\""}.join(' ')
        cookie_string = cookies.empty? ? '' : "--cookie \"#{cookies.map {|k, v| "#{escape(k)}=#{escape(v)}"}.join('; ')}\""
        `curl -X #{method} -s #{cookie_string} #{header_string} -i #{url}`.tap {assert_equal 0, $?.exitstatus, "bad url:#{url}"}
      end

      # Send an HTTP request to the local mock server directly.
      def local_request(url, headers={}, cookies={})
        _request("#{LOCALHOST}:#{DASHBOARD_PORT}#{url}", headers, cookies)
      end

      # Send an HTTP request through the current proxy-cache configuration.
      # The proxy-cache configuration is CloudFront+Varnish or Varnish-only.
      def proxy_request(url, headers={}, cookies={}, method='GET')
        headers[:host] = @proxy_host
        headers.merge!('X-Forwarded-Proto' => 'https') {|_, v1, _| v1}
        _request("#{@proxy_address}#{url}", headers, cookies, method)
      end

      # Asserts the specified HTTP status code was returned by the response.
      def code(response)
        /HTTP\/1\.1 (\d+)/.match(response.lines.to_a.first.strip)[1].to_i
      end

      def assert_ok(response)
        assert_equal 200, code(response)
      end

      # Asserts the CloudFront cache header contains the expected Hit/Miss response.
      def assert_cloudfront_cache(response, hit)
        match = /X-Cache: (\w+) from cloudfront/.match(response)
        refute_nil match, "Didn't find expected CloudFront 'X-Cache:' header."
        assert_equal hit ? 'Hit' : 'Miss', match[1]
      end

      # Asserts the Varnish cache header contains the expected Hit/Miss response.
      def assert_varnish_cache(response, hit)
        match = /X-Varnish-Cache: (\w+)/.match(response)
        refute_nil match, "Didn't find expected Varnish 'X-Varnish-Cache:' header."
        assert_equal hit ? 'HIT' : 'MISS', match[1]
      end

      # Asserts the expected top-most cache-status header contains the expected Hit/Miss response.
      # In the Varnish test suite, this will check the Varnish cache header.
      # In the CloudFront+Varnish test suite, this will check the CloudFront cache header.
      def assert_cache(response, hit)
        if @cloudfront
          assert_cloudfront_cache response, hit
        else
          assert_varnish_cache response, hit
        end
      end

      def assert_miss(response)
        assert_cache response, false
      end

      def assert_hit(response)
        assert_cache response, true
      end

      def last_line(response)
        response.lines.to_a.last.strip
      end

      # Builds a URL with the provided prefix/suffix and a
      # universally unique identifier to ensure cache-freshness.
      def build_url(prefix='x', suffix='')
        id = SecureRandom.uuid
        "/#{prefix}/#{id}/#{suffix}"
      end

      def get_header(response, header)
        match = /#{header}: ([^\s]+)/.match(response)
        match && match[1]
      end
    end
  end
end

module HttpCacheIntegrationTest
  def self.setup(cloudfront=false)
    helpers = Cdo::MockServer::Helpers
    describe 'varnish' do
      include helpers
      before {init(cloudfront)}

      it 'is installed' do
        assert_equal '/usr/sbin/varnishd', `which varnishd`.strip
      end

      it 'is running' do
        assert_equal 0, (`service varnish status` && $?.exitstatus)
      end

      it 'handles service start when running' do
        assert_equal 0, (`service varnish start` && $?.exitstatus)
      end
    end

    describe 'mock http server' do
      include helpers
      before {init(cloudfront)}
      it 'handles a simple request' do
        url = build_url 1
        text = 'Hello World!'
        mock_response url, text
        response = local_request url
        assert_ok response
        assert_equal text, last_line(response)
      end
    end

    describe 'integration server' do
      include helpers
      before {init(cloudfront)}
      it 'redirects HTTP to HTTPS' do
        response = proxy_request('/https', {'X-Forwarded-Proto' => 'none'})
        assert_equal 301, code(response)
        location = /Location: ([^\s]+)/.match(response)[1]
        assert_match /https:\/\/.*\/https/, location
      end
    end

    pid, ngrok_pid = Cdo::MockServer.setup(cloudfront)
    HttpCacheTest.setup(:integration, helpers, cloudfront)
    output = MiniTest::Unit.new.run
    Cdo::MockServer.teardown(pid, ngrok_pid)
    exit output
  end
end

module HttpCacheTest
  def self.setup(environment, helpers, cloudfront=false)
    describe 'http proxy cache' do
      include helpers
      before {init(cloudfront, environment)}

      it 'caches a simple request' do
        url = build_url 2
        text = 'Hello World 2!'
        mock_response url, text

        response = proxy_request url
        assert_ok response
        assert_miss response

        response = proxy_request url
        assert_ok response
        assert_hit response

        # Verify only one request hit the origin server
        assert_equal 1, count_origin_requests(url)
      end

      it 'Handles Accept-Language behaviors' do
        skip 'Not implemented in Rack yet' unless environment == 'integration'
        # URL contains whitelisted 'Accept-Language' header
        url = build_url 's/starwars/stage/1/puzzle'
        text_en = 'Hello World!'
        text_fr = 'Bonjour le Monde!'
        mock_response url, text_en, {'X-Varnish-Accept-Language' => 'en'}
        mock_response url, text_fr, {'X-Varnish-Accept-Language' => 'fr'}
        en = {'Accept-Language' => 'en'}
        response = proxy_request url, en
        assert_miss response
        assert_equal text_en, last_line(response)

        # Ensure that the "Vary: X-Varnish-Accept-Language" response header
        # is returned as "Vary: Accept-Language" from Varnish.
        assert_nil /X-Varnish-Accept-Language/.match(response)
        refute_nil /Accept-Language/.match(response)
        assert_hit proxy_request url, en

        # Ensure that different language responses are separately cached.
        fr = {'Accept-Language' => 'fr'}
        response = proxy_request url, fr
        assert_miss response
        assert_equal text_fr, last_line(response)
        assert_hit proxy_request url, fr

        # Varnish-layer: Ensure that complex Accept-Language request headers are cached
        # based on the first available language from the processed header.
        # In this case, 'fr' will be the language selected.
        fr_2 = {'Accept-Language' => 'da, x-random;q=0.8, fr;q=0.7, en;q=0.5'}
        assert_varnish_cache proxy_request(url, fr_2), true

        # Varnish-layer: Fallback to English on weird Accept-Language request headers
        ['f', ('x' * 50), '*n-gb'].each do |lang|
          lang_hash = {'Accept-Language' => lang}
          response = proxy_request url, lang_hash
          assert_varnish_cache response, true
          assert_equal text_en, last_line(response)
        end
      end

      it 'Strips all request/response cookies from static-asset URLs' do
        url = build_url 4, 'image.png'
        text = 'Hello World!'
        text_cookie = 'Hello Cookie!'
        mock_response url, text, {}, {'Set-Cookie' => 'cookie_key=cookie_value; path=/'}
        mock_response url, text_cookie, {'Cookie' => 'cookie_key=cookie_value'}, {'Set-Cookie' => 'cookie_key2=cookie_value2; path=/'}

        # Origin sees request cookie
        response = local_request url, {}, {cookie_key: 'cookie_value'}
        assert_equal text_cookie, last_line(response)

        # Origin sets response cookie
        response = local_request url
        assert_equal text, last_line(response)
        refute_nil get_header(response, 'Set-Cookie')

        # Cache strips request cookie and strips response cookie
        response = proxy_request url, {}, {cookie_key: 'cookie_value'}
        assert_equal text, last_line(response)
        assert_nil get_header(response, 'Set-Cookie')

        # Cache hit on changed cookies
        assert_hit proxy_request url, {}, {cookie_key: 'cookie_value3', key2: 'value2'}
      end

      it 'Allows whitelisted request cookie to affect cache behavior' do
        url = build_url 5
        cookie = "_learn_session_#{environment}"
        text = 'Hello World!'
        text_cookie = 'Hello Cookie 123!'
        text_cookie_2 = 'Hello Cookie 456!'
        mock_response url, text
        mock_response url, text_cookie, {'Cookie' => "#{cookie}=123;"}
        mock_response url, text_cookie_2, {'Cookie' => "#{cookie}=456;"}

        # Cache passes request cookie to origin
        response = proxy_request url, {}, {cookie => '123'}
        assert_equal text_cookie, last_line(response)
        assert_miss response

        # Cache miss on changed cookies
        response = proxy_request url, {}, {cookie => '456'}
        assert_equal text_cookie_2, last_line(response)
        assert_miss response
      end

      it 'Strips non-whitelisted request cookies' do
        url = build_url 6
        cookie = 'random_cookie'
        text = 'Hello World!'
        text_cookie = 'Hello Cookie!'
        mock_response url, text, {}
        mock_response url, text_cookie, {'Cookie' => "#{cookie}=123;"}, {'Set-Cookie' => "#{cookie}=456; path=/"}

        # Request without cookie
        response = proxy_request url
        assert_equal text, last_line(response)
        assert_miss response

        # Cache strips non-whitelisted request cookie and hits original cached response
        response = proxy_request url, {}, {cookie => '123'}
        assert_equal text, last_line(response)
        assert_hit response
      end

      it 'Strips non-whitelisted response cookies' do
        # TODO: not implemented
        skip 'Not implemented'

        url = build_url 7
        cookie = 'random_cookie'
        text = 'Hello World!'
        mock_response url, text, {}, {'Set-Cookie' => "#{cookie}=abc; path=/"}

        # Response should have cookie stripped
        response = proxy_request url
        assert_equal text, last_line(response)
        assert_nil /Set-Cookie: [^\s]+/.match(response)
        assert_miss response

        # Response should be cached even if response cookie is changed
        mock_response url, text, {}, {'Set-Cookie' => "#{cookie}=def; path=/"}
        assert_hit proxy_request url
      end

      it 'Does not strip cookies from uncached PUT or POST asset requests' do
        # Skip because CloudFront does not support this functionality.
        skip 'Disabled, not supported by CloudFront'

        url = build_url 8, 'image.png'
        cookie = 'random_cookie'
        text = 'Hello World!'
        text_cookie = 'Hello Cookie!'

        set_cookie = {'Set-Cookie' => "#{cookie}=456; path=/"}
        %w(PUT POST).each do |method|
          mock_response url, text, {}, set_cookie, method
          mock_response url, text_cookie, {'Cookie' => "#{cookie}=123"}, set_cookie, method
        end

        # PUT/POST
        %w(POST PUT).each do |method|
          # PUT/POST response should NOT have cookie stripped
          response = proxy_request url, {}, {cookie => '123'}, method
          assert_equal text_cookie, last_line(response)
          assert_miss response
          # PUT/POST response should NOT be cached
          response = proxy_request url, {}, {cookie => '123'}, method
          assert_miss response
        end
      end

      it 'Does not strip cookies from assets in higher-priority whitelisted path' do
        does_not_strip_cookies_from_png_in_path 'api'
      end

      it 'Does not strip cookies from assets in v3/assets path' do
        does_not_strip_cookies_from_png_in_path 'v3/assets'
      end

      it 'Does not strip cookies from assets in v3/animations path' do
        does_not_strip_cookies_from_png_in_path 'v3/animations'
      end

      # rubocop:disable Lint/NestedMethodDefinition
      def does_not_strip_cookies_from_png_in_path(path)
        url = build_url path, 'image.png'
        cookie = 'hour_of_code' # whitelisted for this path
        text = 'Hello World!'
        text_cookie = 'Hello Cookie!'
        mock_response url, text, {}, {'Set-Cookie' => "#{cookie}=cookie_value; path=/"}
        mock_response url, text_cookie, {'Cookie' => "#{cookie}=cookie_value;"}, {'Set-Cookie' => "#{cookie}=cookie_value2; path=/"}

        # Does not strip request cookie or response cookie
        response = proxy_request url, {}, {cookie => 'cookie_value'}
        assert_equal text_cookie, last_line(response)
        refute_nil get_header(response, 'Set-Cookie')
      end
      # rubocop:enable Lint/NestedMethodDefinition

      it 'caches individually on whitelisted cookie values' do
        url = build_url 10
        cookie = 'hour_of_code' # whitelisted for this path
        cookie2 = 'bad_cookie' # not whitelisted for this path
        text = 'Hello World!'
        text_cookie = 'Hello Cookie!'
        mock_response url, text, {}
        mock_response url, text_cookie, {'Cookie' => "#{cookie}=123;"}

        response = proxy_request url, {}, {cookie => '123'}
        assert_equal text_cookie, last_line(response)
        assert_miss response

        # Changed cookie string matching all whitelisted headers will return cached result
        response = proxy_request url, {}, {cookie => '123', cookie2 => '456'}
        assert_equal text_cookie, last_line(response)
        assert_hit response
      end

      it 'returns 403 error on unsupported HTTP methods' do
        url = build_url 11
        mock_response url, 'Hello World!', {}
        response = proxy_request url, {}, {}, 'FOO'
        assert_equal 403, code(response)
      end

      it 'adds a default value for filtered headers' do
        url = build_url 12
        mock_response url, 'Hello World!', {'User-Agent' => 'Cached-Request'}
        response = proxy_request url, {}, {}
        assert_equal 'Hello World!', last_line(response)
      end
    end
  end
end
