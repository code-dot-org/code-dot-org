# Chef test suite for cdo-varnish cookbook.

# Chef node attributes as constants
DASHBOARD_PORT = 8080
PEGASUS_PORT = 8081
VARNISH_PORT = 80
LOCALHOST = 'localhost'

# Setup the mock-server and cache
puts 'setup'
PID = spawn('cd ~; java -jar mock.jar --verbose')
`service varnish restart`
# Don't start tests until both wiremock and varnish are live.
mock_started, varnish_started = false, false
until [mock_started,varnish_started].all?
  `sleep 1`
  unless mock_started
    puts 'testing mock'
    `curl -s -i #{LOCALHOST}:#{DASHBOARD_PORT}/start`
    mock_started = $?.exitstatus == 0
  end
  unless varnish_started
    puts 'testing varnish'
    `curl -s -i #{LOCALHOST}:#{VARNISH_PORT}/start`
    varnish_started = $?.exitstatus == 0
  end
end
puts 'setup finished'

at_exit do
  puts 'teardown'
  `curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/shutdown`
  Process.wait PID
  puts 'teardown finished'
end

require 'json'
require 'minitest/autorun'

describe 'varnish' do
  it 'is installed' do
    assert_equal '/usr/sbin/varnishd', `which varnishd`.strip
  end

  it 'is running' do
    assert_equal 0, (`service varnish status` && $?.exitstatus)
  end
end

# Returns the number of times the specified stub-URL was accessed.
def count_requests(url)
  request = <<JSON
{
  "method": "GET",
  "url": "#{url}"
}
JSON
  JSON.parse(`curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/requests/count -d '#{request}'`)['count']
end

# Mocks a simple text/plain response body at the specified URL.
def mock_url(url, body, request_headers={}, response_headers={}, method='GET')
  json = {
  request: {
    method: method,
    url: url,
    headers: Hash[*request_headers.map{|k, v|[k,{equalTo: v}]}.flatten]
  },
  response: {
    status: 200,
    body: body,
    headers: {
      "Content-Type" => "text/plain"
    }.merge(response_headers)
  }
}.to_json
  `curl -s -X POST #{LOCALHOST}:#{DASHBOARD_PORT}/__admin/mappings/new -d '#{json}'`
end

def _request(url, headers={}, cookies={}, method='GET')
  header_string = headers.map { |key, value| "-H \"#{key}: #{value}\"" }.join(' ')
  cookie_string = cookies.empty? ? '' : "--cookie \"#{cookies.map{|k,v|"#{k}=#{v}"}.join(';')}\""
  `curl -X #{method} -s #{cookie_string} #{header_string} -i #{url}`.tap{assert_equal 0, $?.exitstatus}
end

def request(url, headers={}, cookies={})
  _request("#{LOCALHOST}:#{DASHBOARD_PORT}#{url}", headers, cookies)
end

def proxy_request(url, headers={}, cookies={}, method='GET')
  headers.merge!(host: '_default-studio.code.org')
  headers.merge!('X-Forwarded-Proto' => 'https')
  _request("#{LOCALHOST}:#{VARNISH_PORT}#{url}", headers, cookies, method)
end

def code(response)
  /HTTP\/1\.1 (\d+)/.match(response.lines.to_a.first.strip)[1].to_i
end

def assert_ok(response)
  assert_equal 200, code(response)
end
def assert_cache(response, hit)
  assert_equal hit ? 'HIT' : 'MISS', /X-Varnish-Cache: (\w+)/.match(response)[1]
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

describe 'http' do
  it 'handles a simple request' do
    url = '/cache1'
    text = 'Hello World!'
    mock_url(url, text)
    response = request url
    assert_ok response
    assert_equal text, last_line(response)
  end

  it 'caches a simple request' do
    url = '/cache2'
    text = 'Hello World 2!'
    mock_url(url, text)

    response = proxy_request url
    assert_ok response
    assert_miss response

    response = proxy_request url
    assert_ok response
    assert_hit response

    # Verify only one request hit the origin server
    assert_equal 1, count_requests(url)
  end

  it 'redirects HTTP to HTTPS' do
    response = _request "#{LOCALHOST}:#{VARNISH_PORT}/https"
    assert_equal 301, code(response)
    assert_equal "https://#{LOCALHOST}/https", /Location: ([^\s]+)/.match(response)[1]
  end

  it 'separately caches responses that vary on X-Varnish-Accept-Language' do
    url = '/cache3'
    text_en = 'Hello World!'
    text_fr = 'Bonjour le Monde!'
    mock_url(url, text_en, {'X-Varnish-Accept-Language' => 'en'}, {vary: 'X-Varnish-Accept-Language'})
    mock_url(url, text_fr, {'X-Varnish-Accept-Language' => 'fr'}, {vary: 'X-Varnish-Accept-Language'})
    en = {'Accept-Language' => 'en'}
    response = proxy_request url, en
    assert_miss response
    assert_equal text_en, last_line(response)
    assert_hit proxy_request url, en

    fr = {'Accept-Language' => 'fr'}
    response = proxy_request url, fr
    assert_miss response
    assert_equal text_fr, last_line(response)
    assert_hit proxy_request url, fr
  end

  it 'Strips all request/response cookies from static-asset URLs' do
    url = '/cache4.png'
    text = 'Hello World!'
    text_cookie = 'Hello Cookie!'
    mock_url(url, text, {}, {'Set-Cookie' => 'cookie_key=cookie_value; path=/'})
    mock_url(url, text_cookie, {'Cookie' => 'cookie_key=cookie_value'}, {'Set-Cookie' => 'cookie_key2=cookie_value2; path=/'})

    # Origin sees request cookie
    response = request url, {}, {cookie_key: 'cookie_value'}
    assert_equal text_cookie, last_line(response)

    # Origin sets response cookie
    response = request url
    assert_equal text, last_line(response)
    refute_nil /Cookie: [^\s]+/.match(response)

    # Cache strips request cookie and strips response cookie
    response = proxy_request url, {}, {cookie_key: 'cookie_value'}
    assert_equal text, last_line(response)
    assert_nil /Cookie: [^\s]+/.match(response)

    # Cache hit on changed cookies
    assert_hit proxy_request url, {}, {cookie_key: 'cookie_value3', key2: 'value2'}
  end

  it 'Allows whitelisted request cookie to affect cache behavior' do
    url = '/cache5'
    cookie = '_learn_session__default'
    text = 'Hello World!'
    text_cookie = 'Hello Cookie 123!'
    text_cookie_2 = 'Hello Cookie 456!'
    mock_url(url, text)
    mock_url(url, text_cookie, {'Cookie' => "#{cookie}=123;"})
    mock_url(url, text_cookie_2, {'Cookie' => "#{cookie}=456;"})

    # Cache passes request cookie to origin
    response = proxy_request url, {}, {"#{cookie}" => '123'}
    assert_equal text_cookie, last_line(response)
    assert_miss response

    # Cache miss on changed cookies
    response = proxy_request url, {}, {"#{cookie}" => '456'}
    assert_equal text_cookie_2, last_line(response)
    assert_miss response
  end

  it 'Strips non-whitelisted request cookies' do
    url = '/cache6'
    cookie = 'random_cookie'
    text = 'Hello World!'
    text_cookie = 'Hello Cookie!'
    mock_url(url, text, {})
    mock_url(url, text_cookie, {'Cookie' => "#{cookie}=123;"}, {'Set-Cookie' => "#{cookie}=456; path=/"})

    # Request without cookie
    response = proxy_request url
    assert_equal text, last_line(response)
    assert_miss response

    # Cache strips non-whitelisted request cookie and hits original cached response
    response = proxy_request url, {}, {"#{cookie}" => '123'}
    assert_equal text, last_line(response)
    assert_hit response
  end

  it 'Strips non-whitelisted response cookies' do
    # TODO: not implemented in Varnish config
    skip 'Not implemented in Varnish'

    url = '/cache7'
    cookie = 'random_cookie'
    text = 'Hello World!'
    mock_url(url, text, {}, {'Set-Cookie' => "#{cookie}=abc; path=/"})

    # Response should have cookie stripped
    response = proxy_request url
    assert_equal text, last_line(response)
    assert_nil /Set-Cookie: [^\s]+/.match(response)
    assert_miss response

    # Response should be cached even if response cookie is changed
    mock_url(url, text, {}, {'Set-Cookie' => "#{cookie}=def; path=/"})
    assert_hit proxy_request url
  end

  it 'Does not strip cookies from uncached PUT or POST asset requests' do
    url = '/cache8.png'
    cookie = 'random_cookie'
    text = 'Hello World!'
    text_cookie = 'Hello Cookie!'

    set_cookie = {'Set-Cookie' => "#{cookie}=456; path=/"}
    %w(PUT POST).each do |method|
      mock_url(url, text, {}, set_cookie, method)
      mock_url(url, text_cookie, {'Cookie' => "#{cookie}=123"}, set_cookie, method)
    end

    # PUT/POST
    %w(POST PUT).each do |method|
      # PUT/POST response should NOT have cookie stripped
      puts "Testing #{method}"
      response = proxy_request url, {}, {"#{cookie}" => '123'}, method
      assert_equal text_cookie, last_line(response)
      assert_miss response
      # PUT/POST response should NOT be cached
      response = proxy_request url, {}, {"#{cookie}" => '123'}, method
      assert_miss response
    end
  end

  it 'Does not strip cookies from assets in higher-priority whitelisted path' do
    url = '/api/cache9.png'
    cookie = 'hour_of_code' # whitelisted for this path
    text = 'Hello World!'
    text_cookie = 'Hello Cookie!'
    mock_url(url, text, {}, {'Set-Cookie' => "#{cookie}=cookie_value; path=/"})
    mock_url(url, text_cookie, {'Cookie' => "#{cookie}=cookie_value;"}, {'Set-Cookie' => "#{cookie}=cookie_value2; path=/"})

    # Does not strip request cookie or response cookie
    response = proxy_request url, {}, {"#{cookie}" => 'cookie_value'}
    assert_equal text_cookie, last_line(response)
    refute_nil /Cookie: [^\s]+/.match(response)
  end

end
