require 'webmock/minitest'
WebMock.disable_net_connect!(:allow_localhost => true)
require 'test_helper'

class MediaProxyControllerTest < ActionController::TestCase
  IMAGE_URI = 'http://www.example.com/foo.jpg'
  IMAGE_DATA = 'JPG_\u0000\u00FF'.force_encoding(Encoding::BINARY)

  test "should fetch proxied media in all content types" do
    content_types = [
      'image/bmp', 'image/x-windows-bmp', 'image/gif', 'image/jpeg',
      'image/png', 'image/svg+xml', 'audio/basic', 'audio/mid', 'audio/mpeg',
      'audio/mp4', 'audio/ogg', 'audio/vnd.wav'
    ]

    content_types.each do |content_type|
      stub_request(:get, IMAGE_URI).to_return(body: IMAGE_DATA, headers: {content_type: content_type})
      get :get, u: IMAGE_URI
      assert_response :success
      assert_equal content_type, response.content_type
      cache_control = response['Cache-Control']
      assert cache_control =~ /public/i, 'Response should be publically cacheable'
      assert cache_control =~ /max-age=315576000/i, 'Response should expired in 10 years'
      assert_equal response['Content-Transfer-Encoding'], 'binary'
      assert_equal response['Content-Disposition'], 'inline'
      assert_equal IMAGE_DATA, response.body
    end
  end

  test "should fetch proxied media with redirects" do
    # Cycle through a redirect followed by the actual data.
    stub_request(:get, IMAGE_URI).to_return(
      {body: 'Redirect', status: 302, headers: {location: IMAGE_URI}},
      {body: IMAGE_DATA, headers: {content_type: 'image/jpeg'}}
    )
    get :get, u: IMAGE_URI
    assert_response :success
    assert_equal IMAGE_DATA, response.body
  end

  test "should fail if invalid URL" do
    stub_request(:get, IMAGE_URI).to_return(body: IMAGE_DATA, headers: {content_type: 'image/jpeg'})
    bad_uri = '/foo'
    get :get, u: bad_uri
    assert_response 400
  end

  test "should fail if missing URL" do
    stub_request(:get, IMAGE_URI).to_return(body: IMAGE_DATA, headers: {content_type: 'image/jpeg'})
    get :get, foo: 'bar'
    assert_response 400
  end

  test "should fail if too many redirects" do
    response = {body: 'Redirect', status: 302, headers: {location: IMAGE_URI}}
    stub_request(:get, IMAGE_URI).to_return(
      response,
      response,
      response,
      response,
      response,
      response)
    get :get, u: IMAGE_URI
    assert_response 500
  end

  test "should fail on unauthorized content types" do
    stub_request(:get, IMAGE_URI).to_return(body: IMAGE_DATA, headers: {content_type: 'text/html'})
    get :get, u: IMAGE_URI
    assert_response 400
  end

  test "should pass through server errors" do
    stub_request(:get, IMAGE_URI).to_return(body: IMAGE_DATA, headers: {content_type: 'image/jpeg'}, status: 503)
    get :get, u: IMAGE_URI
    assert_response 503
  end
end
