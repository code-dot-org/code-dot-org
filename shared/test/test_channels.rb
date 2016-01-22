require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class ChannelsTest < Minitest::Test
  include Rack::Test::Methods

  def build_rack_mock_session
    @session = Rack::MockSession.new(ChannelsApi, 'studio.code.org')
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
    start = DateTime.now - 1
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_equal 123, result['abc']

    # Check timestamps.
    created = result['createdAt']
    assert_equal created, result['updatedAt']
    assert (start..DateTime.now).cover? DateTime.parse(created)

    sleep 1

    # Update.
    start = DateTime.now - 1
    post "/v3/channels/#{channel_id}", {abc: 456}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.successful?

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_equal 456, result['abc']

    # Check timestamps.
    assert_equal created, result['createdAt']
    refute_equal result['createdAt'], result['updatedAt']
    assert (start..DateTime.now).cover? DateTime.parse(result['updatedAt'])
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

  def test_unicode_in_channel
    post '/v3/channels', {emoticon: "\xF0\x9F\x91\x8D"}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    assert_equal "\xF0\x9F\x91\x8D", JSON.parse(last_response.body)['emoticon']
  end

  def test_create_channel_from_src
    post '/v3/channels', {abc: 123, hidden: true, frozen: true}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    post "/v3/channels?src=#{channel_id}", '', 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?
    follow_redirect!

    response = JSON.parse(last_response.body)
    assert last_request.url.end_with? "/#{response['id']}"
    assert_equal 123, response['abc']
    assert_equal false, response['hidden']
    assert_equal false, response['frozen']
  end

  def test_abuse
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}/abuse"
    assert last_response.ok?
    assert_equal 0, JSON.parse(last_response.body)['abuse_score']

    post "/v3/channels/#{channel_id}/abuse"
    assert last_response.ok?

    get "/v3/channels/#{channel_id}/abuse"
    assert last_response.ok?
    assert_equal 10, JSON.parse(last_response.body)['abuse_score']

    delete "/v3/channels/#{channel_id}/abuse"
    assert last_response.unauthorized?

    # Ideally we would also test that deleting abuse works when we're an admin
    # but don't currently have a way to simulate admin from tests
  end

  def test_abuse_frozen
    post '/v3/channels', {frozen: true}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}/abuse"
    assert last_response.ok?
    assert_equal 0, JSON.parse(last_response.body)['abuse_score']

    post "/v3/channels/#{channel_id}/abuse"
    assert last_response.ok?

    get "/v3/channels/#{channel_id}/abuse"
    assert last_response.ok?
    assert_equal 0, JSON.parse(last_response.body)['abuse_score']
  end

  def test_most_recent
    post '/v3/channels', {level: 'projects/abc'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    abc_channel_id = last_response.location.split('/').last

    sleep 1

    post '/v3/channels', {level: 'projects/xyz'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    xyz_channel_id = last_response.location.split('/').last

    sleep 1

    # These hidden and frozen projects should be skipped when considering most_recent
    post '/v3/channels', {hidden: true, level: 'projects/abc'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    post '/v3/channels', {frozen: true, level: 'projects/xyz'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'

    user_storage_id = storage_decrypt_id CGI.unescape @session.cookie_jar[storage_id_cookie_name]

    assert_equal abc_channel_id, StorageApps.new(user_storage_id).most_recent('abc')
    assert_equal xyz_channel_id, StorageApps.new(user_storage_id).most_recent('xyz')
  end
end
