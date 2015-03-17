require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class ChannelsTest < Minitest::Unit::TestCase
  include Rack::Test::Methods

  def build_rack_mock_session
    Rack::MockSession.new(ChannelsApi, 'studio.code.org')
  end

  def test_create_channel
    post '/v3/channels', {hello: 'world'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?
    follow_redirect!

    response = JSON.parse(last_response.body)
    assert last_request.url.end_with? "/#{response['id']}"
    assert_equal 'world', response['hello']
  end

  def test_update_channel
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    assert_equal 123, JSON.parse(last_response.body)['abc']

    post "/v3/channels/#{channel_id}", {abc: 456}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.successful?

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    assert_equal 456, JSON.parse(last_response.body)['abc']
  end

  def test_delete_channel
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?

    delete "/v3/channels/#{channel_id}"
    assert last_response.successful?

    get "/v3/channels/#{channel_id}"
    assert last_response.not_found?
  end

  def test_channel_requires_hash
    post '/v3/channels', 5.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.bad_request?
  end

  def test_channel_owner
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    assert_equal true, JSON.parse(last_response.body)['isOwner']

    clear_cookies
    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    assert_equal false, JSON.parse(last_response.body)['isOwner']
  end
end
