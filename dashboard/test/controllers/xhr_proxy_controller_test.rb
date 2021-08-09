require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)
require_relative '../../../shared/test/spy_newrelic_agent'
require 'test_helper'

class XhrProxyControllerTest < ActionController::TestCase
  XHR_REDIRECT_URI = 'https://www.wikipedia.org/bar/a1b2'
  XHR_URI = 'https://www.wikipedia.org/foo?a=1&b=2'
  XHR_DATA = '{"key1":"value1", "key2":2, "obj":{"x":3, "y":4}}'
  XHR_CONTENT_TYPE = 'application/json'
  BAD_CHANNEL_MSG = "XhrProxyController request with invalid channel_id"

  setup do
    @user = create :user
    sign_in @user
    @channel_id = storage_encrypt_channel_id(storage_id_for_user_id(@user.id), 123)
  end

  test "should fetch proxied media with correct content type" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: XHR_URI, c: @channel_id}
    assert_response :success
    assert_equal XHR_CONTENT_TYPE, response.content_type
    cache_control = response['Cache-Control']
    assert cache_control =~ /public/i, 'Response should be publicly cacheable'
    assert cache_control =~ /max-age=60/i, 'Response should expire in 1 minute'
    assert_equal response['Content-Transfer-Encoding'], 'binary'
    assert_equal response['Content-Disposition'], 'inline'
    assert_equal XHR_DATA, response.body
  end

  test "should handle query parameters" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: XHR_URI, c: @channel_id}
    assert_response :success
    assert_equal XHR_DATA, response.body
  end

  test "should log to newrelic" do
    CDO.stubs(:newrelic_logging).returns(true) do
      stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
      assert NewRelic::Agent.events.empty?, 'no custom events initially recorded'
      get :get, params: {u: XHR_URI, c: @channel_id}
      assert_response :success
      assert NewRelic::Agent.events.length == 1, 'one custom event recorded'
      assert NewRelic::Agent.events[0].first == 'XhrProxyControllerRequest', 'XhrProxyControllerRequest event recorded'
    end
  end

  test "should fetch proxied data request with redirects" do
    stub_request(:get, XHR_REDIRECT_URI).to_return(
      body: 'Redirect', status: 302, headers: {location: XHR_URI}
    )
    stub_request(:get, XHR_URI).to_return(
      body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE}
    )
    get :get, params: {u: XHR_REDIRECT_URI, c: @channel_id}
    assert_response :success
    assert_equal XHR_DATA, response.body
  end

  test "should fail if invalid URL" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    bad_uri = '/foo'
    get :get, params: {u: bad_uri, c: @channel_id}
    assert_response 400
  end

  test "should fail if too many redirects" do
    response = {body: 'Redirect', status: 302, headers: {location: XHR_URI}}
    stub_request(:get, XHR_URI).to_return(
      response,
      response,
      response,
      response,
      response,
      response
    )
    get :get, params: {u: XHR_URI, c: @channel_id}
    assert_response 500
  end

  test "should fail on unauthorized content types" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: 'text/html'})
    get :get, params: {u: XHR_URI, c: @channel_id}
    assert_response 400
  end

  test "should succeed on text/plain content type" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: 'text/plain'})
    get :get, params: {u: XHR_URI, c: @channel_id}
    assert_response 200
  end

  test "should fail with ec2.internal hostname suffix" do
    url = 'https://ip-192.168.0.1.ec2.internal/my/secret/api'
    stub_request(:get, url).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: url, c: @channel_id}
    assert_response 400
  end

  # Make sure regexp is properly escaped
  test "should fail with wikipediaXorg hostname suffix" do
    url = 'https://www.wikipediaXorg/foo?a=1&b=2'
    stub_request(:get, url).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: url, c: @channel_id}
    assert_response 400
  end

  test "should fail with wikipedia.org.evil hostname suffix" do
    url = 'https://www.wikipedia.org.evil/foo?a=1&b=2'
    stub_request(:get, url).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: url, c: @channel_id}
    assert_response 400
  end

  test "should pass through server errors" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE}, status: 503)
    get :get, params: {u: XHR_URI, c: @channel_id}
    assert_response 503
  end

  test "should fail with bad channel id" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: XHR_URI, c: '12345'}
    assert_response 403
  end

  test "should fail with missing channel id" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, params: {u: XHR_URI}
    assert_response 403
  end
end
