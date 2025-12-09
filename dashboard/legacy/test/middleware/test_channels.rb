require_relative 'middleware_test_helper'
require_relative '../../middleware/channels_api'
require 'timecop'
require 'active_support/time'

class ChannelsTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

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

    Timecop.travel 1

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
  ensure
    Timecop.return
  end

  def test_update_channel_and_publish_library
    # Create channel
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_nil result['libraryPublishedAt']

    # Update channel where publishLibrary is false
    post "/v3/channels/#{channel_id}", {publishLibrary: false}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.successful?

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_nil result['libraryPublishedAt']

    # Update channel where publishLibrary is true
    post "/v3/channels/#{channel_id}", {publishLibrary: true}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.successful?

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    refute_nil result['libraryPublishedAt']
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

  def test_sharing_disabled
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    # sharing_disabled for a channel owned by current user should always be false
    get "/v3/channels/#{channel_id}/sharing_disabled"
    assert last_response.ok?
    assert_equal false, JSON.parse(last_response.body)['sharing_disabled']

    # User is not the owner, should return owner sharing_disabled
    ChannelsApi.any_instance.stubs(:current_user_id).returns(123)
    # Stub sharing_disabled to false for user.
    Projects.any_instance.stubs(:get_user_sharing_disabled).returns(false)
    get "/v3/channels/#{channel_id}/sharing_disabled"
    assert last_response.ok?
    assert_equal false, JSON.parse(last_response.body)['sharing_disabled']
    Projects.any_instance.unstub(:get_user_sharing_disabled)

    # Stub sharing_disabled to true for user.
    Projects.any_instance.stubs(:get_user_sharing_disabled).returns(true)
    get "/v3/channels/#{channel_id}/sharing_disabled"
    assert last_response.ok?
    assert_equal true, JSON.parse(last_response.body)['sharing_disabled']
    Projects.any_instance.unstub(:get_user_sharing_disabled)
  end

  def test_most_recent
    post '/v3/channels', {level: 'projects/abc'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    abc_channel_id = last_response.location.split('/').last

    Timecop.travel 1

    post '/v3/channels', {level: 'projects/xyz'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    xyz_channel_id = last_response.location.split('/').last

    Timecop.travel 1

    # These hidden and frozen projects should be skipped when considering most_recent
    post '/v3/channels', {hidden: true, level: 'projects/abc'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    hidden_channel_id = last_response.location.split('/').last

    Timecop.travel 1

    post '/v3/channels', {frozen: true, level: 'projects/xyz'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'

    user_storage_id = storage_decrypt_id CGI.unescape @session.cookie_jar[storage_id_cookie_name]

    assert_equal abc_channel_id, Projects.new(user_storage_id).most_recent('abc')
    assert_equal xyz_channel_id, Projects.new(user_storage_id).most_recent('xyz')

    # Includes hidden projects if include_hidden is true
    assert_equal hidden_channel_id, Projects.new(user_storage_id).most_recent('abc', include_hidden: true)
  ensure
    Timecop.return
  end

  def test_update_channel_with_bad_json
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    post "/v3/channels/#{channel_id}", '{', 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert_equal 400, last_response.status
  end

  def test_remix_parent
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    encrypted_parent_channel_id = last_response.location.split('/').last

    post "/v3/channels?parent=#{encrypted_parent_channel_id}", {def: 456}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?
    follow_redirect!

    response = JSON.parse(last_response.body)
    assert last_request.url.end_with? "/#{response['id']}"
    assert_equal 456, response['def']

    _, storage_app_id = storage_decrypt_channel_id(response['id'])
    _, parent_storage_app_id = storage_decrypt_channel_id(encrypted_parent_channel_id)
    assert_equal parent_storage_app_id, Projects.table.where(id: storage_app_id).first[:remix_parent_id]
  end

  def test_update_project_type
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    encrypted_channel_id = last_response.location.split('/').last
    _, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    assert_nil Projects.table.where(id: storage_app_id).first[:project_type]

    post "/v3/channels/#{encrypted_channel_id}", {projectType: 'gamelab'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.successful?
    assert_equal 'gamelab', Projects.table.where(id: storage_app_id).first[:project_type]
  end

  def test_update_with_good_thumbnail_url_succeeds
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    post "/v3/channels/#{channel_id}", {thumbnailUrl: "/v3/files/#{channel_id}/.metadata/thumbnail.png"}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.successful?
  end

  def test_update_with_bad_thumbnail_url_fails
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    post "/v3/channels/#{channel_id}", {thumbnailUrl: "bad.com"}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert_equal 400, last_response.status
  end

  def test_create_with_good_thumbnail_url_succeeds
    post '/v3/channels', {thumbnailUrl: '/v3/files/parentChannelId123/.metadata/thumbnail.png'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?
  end

  def test_create_with_bad_thumbnail_fails
    post '/v3/channels', {thumbnailUrl: "bad.com"}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert_equal 400, last_response.status
  end

  private def timestamp(time)
    time.strftime('%Y-%m-%d %H:%M:%S.%L')
  end

  private def stub_project_body(should_restrict_share)
    sample_project = StringIO.new
    sample_project.puts "{\"inRestrictedShareMode\": #{should_restrict_share}}"
    SourceBucket.any_instance.stubs(:get).returns({body: sample_project})
  end
end
