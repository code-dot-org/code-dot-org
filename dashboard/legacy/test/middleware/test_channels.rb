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

  def test_create_published_channel
    old_user = {name: ' xavier', birthday: 14.years.ago.to_datetime}
    ChannelsApi.any_instance.stubs(:current_user).returns(old_user)
    start = DateTime.now - 1
    post '/v3/channels', {shouldPublish: true, projectType: 'artist', key: 'val'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?, 'old user can publish artist project'
    follow_redirect!

    response = JSON.parse(last_response.body)
    assert last_request.url.end_with? "/#{response['id']}"

    refute_nil response['publishedAt']
    published_at = DateTime.parse(response['publishedAt'])
    assert (start..DateTime.now).cover? published_at
    assert_equal 'val', response['key']

    post '/v3/channels', {shouldPublish: true, projectType: 'bogus', key: 'val'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.client_error?, 'cannot publish invalid project type'

    young_user_cannot_share = {
      name: ' xavier',
      birthday: 12.years.ago.to_datetime,
      properties: {sharing_disabled: true}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(young_user_cannot_share)

    post '/v3/channels', {shouldPublish: true, projectType: 'playlab', key: 'val'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?, 'young user can publish playlab project'

    post '/v3/channels', {shouldPublish: true, projectType: 'applab', key: 'val'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.client_error?, 'young user cannot publish advanced project type if sharing is disabled'

    young_user_can_share = {
      name: ' xavier',
      birthday: 12.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(young_user_can_share)

    post '/v3/channels', {shouldPublish: true, projectType: 'applab', key: 'val'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?, 'young user can publish advanced project type if sharing is enabled'
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

  def test_publish_and_unpublish_channel
    stub_project_age(true, true)

    stub_user = {
      name: ' xavier',
      birthday: 14.years.ago.to_datetime
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    start = DateTime.now - 1
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)

    # initially the project is unpublished
    assert_includes result.keys, 'publishedAt'
    assert_nil result['publishedAt']

    # non-owner cannot publish
    with_session(:non_owner) do
      assert_cannot_publish('applab', channel_id)
    end

    # publish the project and validate the result
    post "/v3/channels/#{channel_id}/publish/applab", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert (start..DateTime.now).cover? DateTime.parse(result['publishedAt'])

    # now the project should appear published

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert (start..DateTime.now).cover? DateTime.parse(result['publishedAt'])
    assert_equal result['projectType'], 'applab'

    get "/v3/channels"
    assert last_response.ok?
    result = JSON.parse(last_response.body).first
    assert (start..DateTime.now).cover? DateTime.parse(result['publishedAt'])
    assert_equal result['projectType'], 'applab'

    # non-owner cannot unpublish
    with_session(:non_owner) do
      assert_cannot_unpublish(channel_id)
    end

    # unpublish the project
    post "/v3/channels/#{channel_id}/unpublish", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_includes result.keys, 'publishedAt'
    assert_nil result['publishedAt']

    # now the project should appear unpublished
    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_includes result.keys, 'publishedAt'
    assert_nil result['publishedAt']
  end

  def test_publish_permissions
    stub_project_age(true, true)

    # only allow listed project types can be published

    # over 13 and sharing is disabled
    stub_user = {
      name: ' xavier',
      birthday: 14.years.ago.to_datetime,
      properties: {sharing_disabled: true}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    assert_cannot_publish('applab')
    assert_cannot_publish('gamelab')
    assert_can_publish('artist')
    assert_can_publish('playlab')
    assert_cannot_publish('weblab')
    assert_cannot_publish('foo')

    # over 13 and sharing is enabled
    stub_user = {
      name: ' xavier',
      birthday: 14.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    assert_can_publish('applab')
    assert_can_publish('gamelab')
    assert_can_publish('artist')
    assert_can_publish('playlab')
    assert_cannot_publish('weblab')
    assert_cannot_publish('foo')

    # under 13 sharing disabled
    stub_user = {
      name: ' xavier',
      birthday: 12.years.ago.to_datetime,
      properties: {sharing_disabled: true}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    assert_cannot_publish('applab')
    assert_cannot_publish('gamelab')
    assert_can_publish('artist')
    assert_can_publish('playlab')
    assert_cannot_publish('weblab')
    assert_cannot_publish('foo')

    # under 13 sharing enabled
    stub_user = {
      name: ' xavier',
      birthday: 12.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    assert_can_publish('applab')
    assert_can_publish('gamelab')
    assert_can_publish('artist')
    assert_can_publish('playlab')
    assert_cannot_publish('weblab')
    assert_cannot_publish('foo')

    # non-owners cannot publish or unpublish
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last
    with_session(:non_owner) do
      assert_cannot_publish('artist', channel_id)
    end

    # users with sharing disabled cannot share applab or  gamelab projects
    stub_user = {
      name: ' xavier',
      birthday: 12.years.ago.to_datetime,
      properties: {sharing_disabled: true}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    assert_cannot_publish('applab')
    assert_cannot_publish('gamelab')
    assert_can_publish('artist')
    assert_can_publish('playlab')
    assert_cannot_publish('weblab')
    assert_cannot_publish('foo')
  end

  def test_cannot_publish_if_account_too_new
    stub_project_age(true, false)

    stub_user = {
      name: 'xavier',
      birthday: 14.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)

    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    assert_cannot_publish('applab', channel_id)
  end

  def test_cannot_publish_if_project_too_new
    stub_project_age(false, true)

    stub_user = {
      name: ' xavier',
      birthday: 14.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)

    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    assert_cannot_publish('applab', channel_id)
  end

  def test_can_publish_when_override_applied
    stub_project_age(false, false, false)

    stub_user = {
      name: ' xavier',
      birthday: 14.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)

    assert_can_publish('applab')
  end

  def test_restricted_publish_permissions
    stub_project_age(true, true)

    # sprite lab projects require talking to S3
    AWS::S3.stubs :create_client

    # under 13 sharing enabled
    stub_user = {
      name: ' xavier',
      birthday: 12.years.ago.to_datetime,
      properties: {sharing_disabled: false}.to_json
    }
    ChannelsApi.any_instance.stubs(:current_user).returns(stub_user)
    stub_project_body(true)
    # stubbed project has restricted share mode set to true, this means we cannot publish
    assert_cannot_publish('spritelab')
    stub_project_body(false)
    # stubbed project has restricted share mode set to false, this means we can publish
    assert_can_publish('spritelab')

    SourceBucket.any_instance.unstub(:get)
    AWS::S3.unstub(:create_client)
  end

  def test_disable_and_enable_content_moderation
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last
    # Only project_validators should be able to set content_moderation.
    post "/v3/channels/#{channel_id}/disable-content-moderation"
    assert last_response.unauthorized?

    ChannelsApi.any_instance.stubs(:project_validator?).returns(true)

    post "/v3/channels/#{channel_id}/disable-content-moderation"
    assert last_response.ok?
    assert_equal true, JSON.parse(last_response.body)['skip_content_moderation']

    # Call to disable again and confirm the result to ensure it's not just a toggle.
    post "/v3/channels/#{channel_id}/disable-content-moderation"
    assert last_response.ok?
    assert_equal true, JSON.parse(last_response.body)['skip_content_moderation']

    post "/v3/channels/#{channel_id}/enable-content-moderation"
    assert last_response.ok?
    assert_equal false, JSON.parse(last_response.body)['skip_content_moderation']

    # Call to enable again and confirm the result to ensure it's not just a toggle.
    post "/v3/channels/#{channel_id}/enable-content-moderation"
    assert last_response.ok?
    assert_equal false, JSON.parse(last_response.body)['skip_content_moderation']

    ChannelsApi.any_instance.unstub(:project_validator?)
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

  private def assert_can_publish(project_type)
    start = 1.second.ago
    post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel_id = last_response.location.split('/').last

    post "/v3/channels/#{channel_id}/publish/#{project_type}", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    refute_nil result['publishedAt']
    finish = 1.second.since
    published = DateTime.parse(result['publishedAt'])
    assert ((start..finish).cover? published), "(#{timestamp(start)}..#{timestamp(finish)}) covers #{timestamp(published)}"

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert (start..DateTime.now).cover? DateTime.parse(result['publishedAt'])
    assert_equal result['projectType'], project_type
  end

  private def assert_cannot_publish(project_type, channel_id = nil)
    unless channel_id
      post '/v3/channels', {abc: 123}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
      channel_id = last_response.location.split('/').last
    end

    post "/v3/channels/#{channel_id}/publish/#{project_type}", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.client_error?

    get "/v3/channels/#{channel_id}"
    assert last_response.ok?
    result = JSON.parse(last_response.body)
    assert_includes result.keys, 'publishedAt'
    assert_nil result['publishedAt']
  end

  private def assert_cannot_unpublish(channel_id)
    post "/v3/channels/#{channel_id}/unpublish", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.client_error?
  end

  private def stub_project_body(should_restrict_share)
    sample_project = StringIO.new
    sample_project.puts "{\"inRestrictedShareMode\": #{should_restrict_share}}"
    SourceBucket.any_instance.stubs(:get).returns({body: sample_project})
  end

  private def stub_project_age(project_old_enough, user_old_enough, apply_publish_limits = true)
    test_project = mock
    test_project.stubs(:existed_long_enough_to_publish?).returns(project_old_enough)
    test_project.stubs(:owner_existed_long_enough_to_publish?).returns(user_old_enough)
    test_project.stubs(:apply_project_age_publish_limits?).returns(apply_publish_limits)

    Projects.any_instance.stubs(:get_rails_project).returns(test_project)
  end
end
