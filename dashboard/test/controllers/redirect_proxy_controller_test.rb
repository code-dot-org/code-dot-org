require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)
require 'test_helper'

class RedirectProxyControllerTest < ActionController::TestCase
  LONG_URI = 'https://studio.code.org/s/course1/lessons/3/levels/2'

  test "should successfully get a redirect for url in whitelist" do
    short_uri = 'http://bit.ly/2gPJmTQ'
    stub_request(:head, short_uri).to_return(
      status: 301,
      headers: {Location: LONG_URI}
    )

    get :get, params: {u: short_uri}

    assert_response :success
    assert_equal LONG_URI, response.body
  end

  test 'should avoid attempting redirect if not on whitelist' do
    local_uri = "http://foo.com/bar"

    get :get, params: {u: local_uri}

    # Would expect test to fail if it tried to hit network because of WebMock.disable_net_connect
    assert_response :success
    assert_equal local_uri, response.body
  end

  test 'should fail if attempting to hit invalid uri' do
    get :get, params: {u: 'invaliduri'}
    assert_response 400
  end

  test 'should avoid redirect if host/port match this server' do
    local_uri = "http://test.host:80/foobar"
    get :get, params: {u: local_uri}

    assert_response :success
    assert_equal local_uri, response.body
  end

  test "should fail if too many redirects" do
    short_uri = 'http://bit.ly/2gPJmTQ'

    response = {body: 'Redirect', status: 302, headers: {location: short_uri}}
    stub_request(:head, short_uri).to_return(
      response,
      response,
      response,
      response,
      response,
      response
    )
    get :get, params: {u: short_uri}
    assert_response 500
  end
end
