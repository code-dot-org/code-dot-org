require 'webmock/minitest'
WebMock.disable_net_connect!(:allow_localhost => true)
require 'test_helper'
require_relative '../../../shared/test/spy_newrelic_agent'
require_relative '../../../shared/middleware/helpers/storage_id'

class XhrProxyControllerTest < ActionController::TestCase
  XHR_REDIRECT_URI = 'https://www.example.com/foo/a1b2'
  XHR_URI = 'https://www.example.com/foo?a=1&b=2'
  XHR_DATA = '{"key1":"value1", "key2":2, "obj":{"x":3, "y":4}}'
  XHR_CONTENT_TYPE = 'application/json'
  CHANNEL_ID = storage_encrypt_channel_id('33', '44')
  BAD_CHANNEL_MSG = "XhrProxyController request with invalid channel_id"

  test "should fetch proxied media with correct content type" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, u: XHR_URI, c: CHANNEL_ID
    assert_response :success
    assert_equal XHR_CONTENT_TYPE, response.content_type
    cache_control = response['Cache-Control']
    assert cache_control =~ /public/i, 'Response should be publicly cacheable'
    assert cache_control =~ /max-age=60/i, 'Response should expire in 1 minute'
    assert_equal response['Content-Transfer-Encoding'], 'binary'
    assert_equal response['Content-Disposition'], 'inline'
    assert_equal XHR_DATA, response.body
  end

  test "should log to newrelic" do
    CDO.stubs(:newrelic_logging).returns(true) do
      stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
      assert NewRelic::Agent.events.length == 0, 'no custom events initially recorded'
      get :get, u: XHR_URI, c: CHANNEL_ID
      assert_response :success
      assert NewRelic::Agent.events.length == 1, 'one custom event recorded'
      assert NewRelic::Agent.events[0].first == 'XhrProxyControllerRequest', 'XhrProxyControllerRequest event recorded'
    end
  end

  test "should fetch proxied data request with redirects" do
    stub_request(:get, XHR_REDIRECT_URI).to_return(
        body: 'Redirect', status: 302, headers: {location: XHR_URI})
    stub_request(:get, XHR_URI).to_return(
        body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    get :get, u: XHR_REDIRECT_URI, c: CHANNEL_ID
    assert_response :success
    assert_equal XHR_DATA, response.body
  end

  test "should fail if invalid URL" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    bad_uri = '/foo'
    get :get, u: bad_uri, c: CHANNEL_ID
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
        response)
    get :get, u: XHR_URI, c: CHANNEL_ID
    assert_response 500
  end

  test "should fail on unauthorized content types" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: 'text/html'})
    get :get, u: XHR_URI, c: CHANNEL_ID
    assert_response 400
  end

  test "should pass through server errors" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE}, status: 503)
    get :get, u: XHR_URI, c: CHANNEL_ID
    assert_response 503
  end

  test "should fail with bad channel id" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    begin
      get :get, u: XHR_URI, c: '12345'
      raise 'Invalid channel id should raise an exception'
    rescue Exception => e
      assert e.message.include?(BAD_CHANNEL_MSG), 'Exception message should indicate invalid channel'
    end
  end

  test "should fail with missing channel id" do
    stub_request(:get, XHR_URI).to_return(body: XHR_DATA, headers: {content_type: XHR_CONTENT_TYPE})
    begin
      get :get, u: XHR_URI
      raise 'Missing channel id should raise an exception'
    rescue Exception => e
      assert e.message.include?(BAD_CHANNEL_MSG), 'Exception message should indicate invalid channel'
    end
  end
end
