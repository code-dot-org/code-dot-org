require 'minitest/autorun'
require 'rack/test'
ENV['RACK_ENV'] = 'test'
require_relative '../../deployment'
require 'cdo/rack/whitelist'

require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'

class HttpCacheTest < Minitest::Test
  module RackTest
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
          response[:request].all?{|name, value| env["HTTP_#{name.upcase.tr('-', '_')}"] == value }
      end
      responses.max_by{|r| r[:request].length}
    end

    def app
      mock = mock_app
      Rack::Builder.app do
        use Rack::Whitelist::Downstream,
          HttpCache.config(rack_env)[:dashboard]

        require 'rack/cache'
        use Rack::Cache, ignore_headers: []
        use Rack::Whitelist::Upstream,
          HttpCache.config(rack_env)[:dashboard]
        run(mock)
      end
    end
  end

  module Helpers
    # Builds a URL with the provided prefix/suffix and a
    # universally unique identifier to ensure cache-freshness.
    def build_url(prefix='x', suffix='')
      id = SecureRandom.uuid
      "/#{prefix}/#{id}/#{suffix}"
    end

    # Mocks a simple text/plain response body at the specified URL.
    def mock_response(url, body, request_headers={}, response_headers={}, method='GET')
      @mock_responses.push({
        url: url,
        body: body,
        request: request_headers,
        response: response_headers,
        method: method
      })
    end

    def proxy_request(url, headers={}, cookies={}, method='GET')
      headers.each do |name, value|
        header name, value
      end
      session = build_rack_mock_session
      cookies.each do |key, value|
        session.set_cookie("#{key}=#{value}")
      end
      request url, method: method
    end

    def local_request(url, headers={}, cookies={})
      session = Rack::MockSession.new(mock_app, 'localhost.code.org')
      headers.each do |name, value|
        session.header name, value
      end
      cookies.each do |key, value|
        session.set_cookie("#{key}=#{value}")
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
      assert_equal hit ? 'fresh' : 'miss, store', response.headers['X-Rack-Cache']
    end

    def count_origin_requests(url)
      @origin_requests[url]
    end

    def last_line(response)
      response.body
    end
  end

  describe 'http proxy cache' do
    before do
      @mock_responses = []
    end
    include RackTest
    include Helpers
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
      refute_nil response.headers['Set-Cookie']

      # Cache strips request cookie and strips response cookie
      response = proxy_request url, {}, {cookie_key: 'cookie_value'}
      assert_equal text, last_line(response)
      assert_nil response.headers['Set-Cookie']

      # Cache hit on changed cookies
      assert_hit proxy_request url, {}, {cookie_key: 'cookie_value3', key2: 'value2'}
    end

    it 'Allows whitelisted request cookie to affect cache behavior' do
      url = build_url 5
      cookie = "_learn_session_#{rack_env}"
      text = 'Hello World!'
      text_cookie = 'Hello Cookie 123!'
      text_cookie_2 = 'Hello Cookie 456!'
      mock_response url, text
      mock_response url, text_cookie, {'Cookie' => "#{cookie}=123"}
      mock_response url, text_cookie_2, {'Cookie' => "#{cookie}=456"}

      # Cache passes request cookie to origin
      response = proxy_request url, {}, {"#{cookie}" => '123'}
      assert_equal text_cookie, last_line(response)
      assert_miss response

      # Cache miss on changed cookies
      response = proxy_request url, {}, {"#{cookie}" => '456'}
      assert_equal text_cookie_2, last_line(response)
      assert_miss response
    end

    it 'caches individually on whitelisted cookie values' do
      url = build_url 10
      cookie = 'hour_of_code' # whitelisted for this path
      cookie2 = 'bad_cookie' # not whitelisted for this path
      text = 'Hello World!'
      text_cookie = 'Hello Cookie!'
      mock_response url, text, {}
      mock_response url, text_cookie, {'Cookie' => "#{cookie}=123"}

      response = proxy_request url, {}, {"#{cookie}" => '123'}
      assert_equal text_cookie, last_line(response)
      assert_miss response

      # Changed cookie string matching all whitelisted headers will return cached result
      response = proxy_request url, {}, {"#{cookie}" => '123', "#{cookie2}" => '456'}
      assert_equal text_cookie, last_line(response)
      assert_hit response
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
      response = proxy_request url, {}, {"#{cookie}" => '123'}
      assert_equal text, last_line(response)
      assert_hit response
    end

    it 'Does not strip cookies from assets in higher-priority whitelisted path' do
      url = build_url 'api', 'image.png'
      cookie = 'hour_of_code' # whitelisted for this path
      text = 'Hello World!'
      text_cookie = 'Hello Cookie!'
      mock_response url, text, {}, {'Set-Cookie' => "#{cookie}=cookie_value; path=/"}
      mock_response url, text_cookie, {'Cookie' => "#{cookie}=cookie_value"}, {'Set-Cookie' => "#{cookie}=cookie_value2; path=/"}

      # Does not strip request cookie or response cookie
      response = proxy_request url, {}, {"#{cookie}" => 'cookie_value'}
      assert_equal text_cookie, last_line(response)
      refute_nil response.headers['Set-Cookie']
    end

    it 'returns 403 error on unsupported HTTP methods' do
      url = build_url 11
      mock_response url, 'Hello World!', {}, {}, 'FOO'
      response = proxy_request url, {}, {}, 'FOO'
      assert_equal 403, code(response)
    end

    it 'redirects HTTP to HTTPS' do
      skip 'handled by Rack::SslEnforcer'
      response = _request "#{LOCALHOST}:#{VARNISH_PORT}/https"
      assert_equal 301, code(response)
      assert_equal "https://#{LOCALHOST}/https", /Location: ([^\s]+)/.match(response)[1]
    end

    it 'Handles Accept-Language behaviors' do
      skip 'not implemented yet.'
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
        response = proxy_request url, {}, {"#{cookie}" => '123'}, method
        assert_equal text_cookie, last_line(response)
        assert_miss response
        # PUT/POST response should NOT be cached
        response = proxy_request url, {}, {"#{cookie}" => '123'}, method
        assert_miss response
      end
    end

  end

end
