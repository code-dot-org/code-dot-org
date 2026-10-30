require 'test_helper'
require 'testing/projects_backends'

class ChannelsApiTest < ActionDispatch::IntegrationTest
  include ProjectsBackends

  JSON_HEADERS = {'CONTENT_TYPE' => 'application/json;charset=utf-8'}.freeze

  # Raises ArgumentError while base64-decoding.
  CAUSES_ARGUMENT_ERROR = 'bT0zAyBvk'.freeze
  # Decodes, then raises OpenSSL::Cipher::CipherError while decrypting.
  CAUSES_CIPHER_ERROR = 'IMALITTLETEAPOTSHORTANDSTOUT'.freeze

  test 'create channel' do
    post '/v3/channels', params: {hello: 'world'}.to_json, headers: JSON_HEADERS
    assert_response :moved_permanently
    follow_redirect!

    body = JSON.parse(response.body)
    assert request.url.end_with?("/#{body['id']}")
    assert_equal 'world', body['hello']
    assert Cdo::AnonUserId.valid?(get_user_storage_id({id: cookie_storage_id})[:anon_user_id])
  end

  test 'update channel' do
    start = DateTime.now - 1
    channel_id = create_channel(abc: 123)

    get "/v3/channels/#{channel_id}"
    assert_response :ok
    result = JSON.parse(response.body)
    assert_equal 123, result['abc']

    created = result['createdAt']
    assert_equal created, result['updatedAt']
    assert (start..DateTime.now).cover?(DateTime.parse(created))

    Timecop.travel 1

    start = DateTime.now - 1
    post "/v3/channels/#{channel_id}", params: {abc: 456}.to_json, headers: JSON_HEADERS
    assert_response :success

    get "/v3/channels/#{channel_id}"
    assert_response :ok
    result = JSON.parse(response.body)
    assert_equal 456, result['abc']
    assert_equal created, result['createdAt']
    refute_equal result['createdAt'], result['updatedAt']
    assert (start..DateTime.now).cover?(DateTime.parse(result['updatedAt']))
  ensure
    Timecop.return
  end

  test 'update channel and publish library' do
    channel_id = create_channel
    assert_nil channel(channel_id)['libraryPublishedAt']

    post "/v3/channels/#{channel_id}", params: {publishLibrary: false}.to_json, headers: JSON_HEADERS
    assert_response :success
    assert_nil channel(channel_id)['libraryPublishedAt']

    post "/v3/channels/#{channel_id}", params: {publishLibrary: true}.to_json, headers: JSON_HEADERS
    assert_response :success
    refute_nil channel(channel_id)['libraryPublishedAt']
  end

  test 'delete channel' do
    channel_id = create_channel
    get "/v3/channels/#{channel_id}"
    assert_response :ok

    delete "/v3/channels/#{channel_id}"
    assert_response :success

    assert_not_found {get "/v3/channels/#{channel_id}"}
  end

  test 'list channels' do
    channel_ids = [create_channel(name: 'first'), create_channel(name: 'second')]
    delete "/v3/channels/#{create_channel}"

    get '/v3/channels'
    assert_response :ok
    channels = JSON.parse(response.body)
    assert_equal channel_ids.sort, channels.pluck('id').sort
    assert(channels.all? {|channel| channel['isOwner']})
  end

  test 'channel requires hash' do
    post '/v3/channels', params: 5.to_json, headers: JSON_HEADERS
    assert_response :bad_request
  end

  test 'channel owner' do
    channel_id = create_channel
    assert_equal true, channel(channel_id)['isOwner']

    reset!
    assert_equal false, channel(channel_id)['isOwner']
  end

  test 'unicode in channel' do
    channel_id = create_channel(emoticon: "\u{1F44D}")
    assert_equal "\u{1F44D}", channel(channel_id)['emoticon']
  end

  test 'sharing disabled' do
    channel_id = create_channel

    # Sharing is never disabled for the channel's owner.
    get "/v3/channels/#{channel_id}/sharing_disabled"
    assert_response :ok
    assert_equal false, JSON.parse(response.body)['sharing_disabled']

    # Anyone else gets the owner's setting.
    ChannelsApi.any_instance.stubs(:current_user_id).returns(123)
    Projects.any_instance.stubs(:get_user_sharing_disabled).returns(false)
    get "/v3/channels/#{channel_id}/sharing_disabled"
    assert_response :ok
    assert_equal false, JSON.parse(response.body)['sharing_disabled']

    Projects.any_instance.stubs(:get_user_sharing_disabled).returns(true)
    get "/v3/channels/#{channel_id}/sharing_disabled"
    assert_response :ok
    assert_equal true, JSON.parse(response.body)['sharing_disabled']
  end

  test 'most recent' do
    start = Time.utc(2026, 10, 1)
    abc_channel_id = Timecop.freeze(start) {create_channel(level: 'projects/abc')}
    xyz_channel_id = Timecop.freeze(start + 1.minute) {create_channel(level: 'projects/xyz')}
    # Hidden and frozen projects are skipped when considering most_recent.
    hidden_channel_id = Timecop.freeze(start + 2.minutes) {create_channel(hidden: true, level: 'projects/abc')}
    Timecop.freeze(start + 3.minutes) {create_channel(frozen: true, level: 'projects/xyz')}

    projects = Projects.new(cookie_storage_id)
    assert_equal abc_channel_id, projects.most_recent('abc')
    assert_equal xyz_channel_id, projects.most_recent('xyz')
    assert_equal hidden_channel_id, projects.most_recent('abc', true)
  end

  test 'update channel with bad json' do
    channel_id = create_channel(abc: 123)
    post "/v3/channels/#{channel_id}", params: '{', headers: JSON_HEADERS
    assert_response :bad_request
  end

  test 'remix parent' do
    parent_channel_id = create_channel(abc: 123)

    post "/v3/channels?parent=#{parent_channel_id}", params: {def: 456}.to_json, headers: JSON_HEADERS
    assert_response :moved_permanently
    follow_redirect!
    body = JSON.parse(response.body)
    assert request.url.end_with?("/#{body['id']}")
    assert_equal 456, body['def']

    _, parent_project_id = get_storage_id_and_project_id(parent_channel_id)
    assert_equal parent_project_id, project_row(body['id'])[:remix_parent_id]
  end

  test 'update project type' do
    channel_id = create_channel(abc: 123)
    assert_nil project_row(channel_id)[:project_type]

    post "/v3/channels/#{channel_id}", params: {projectType: 'gamelab'}.to_json, headers: JSON_HEADERS
    assert_response :success
    assert_equal 'gamelab', project_row(channel_id)[:project_type]
  end

  test 'update with good thumbnail url succeeds' do
    channel_id = create_channel(abc: 123)
    thumbnail_url = "/v3/files/#{channel_id}/.metadata/thumbnail.png"
    post "/v3/channels/#{channel_id}", params: {thumbnailUrl: thumbnail_url}.to_json, headers: JSON_HEADERS
    assert_response :success
  end

  test 'update with bad thumbnail url fails' do
    channel_id = create_channel(abc: 123)
    post "/v3/channels/#{channel_id}", params: {thumbnailUrl: 'bad.com'}.to_json, headers: JSON_HEADERS
    assert_response :bad_request
  end

  test 'create with good thumbnail url succeeds' do
    thumbnail_url = '/v3/files/parentChannelId123/.metadata/thumbnail.png'
    post '/v3/channels', params: {thumbnailUrl: thumbnail_url}.to_json, headers: JSON_HEADERS
    assert_response :moved_permanently
  end

  test 'create with bad thumbnail url fails' do
    post '/v3/channels', params: {thumbnailUrl: 'bad.com'}.to_json, headers: JSON_HEADERS
    assert_response :bad_request
  end

  test 'update channel truncates subprojects for music dance ai' do
    project_type = SharedConstants::BUBBLE_CHOICE_CUSTOM_MODES[:MUSIC_DANCE_AI]
    max_subprojects = SharedConstants::BUBBLE_CHOICE_CUSTOM_MODE_MAX_SUBPROJECTS
    channel_id = create_channel(projectType: project_type)

    subprojects = Array.new(max_subprojects + 2) {|i| {'channel_id' => "sub_#{i}", 'level_id' => "level_#{i}"}}
    post "/v3/channels/#{channel_id}", params: {projectType: project_type, subprojects: subprojects}.to_json, headers: JSON_HEADERS
    assert_response :success
    assert_equal subprojects.first(max_subprojects), channel(channel_id)['subprojects']
  end

  test 'update channel removes subprojects for other project types' do
    channel_id = create_channel(projectType: 'applab')

    subprojects = [{'channel_id' => 'sub_0', 'level_id' => 'level_0'}]
    post "/v3/channels/#{channel_id}", params: {projectType: 'applab', subprojects: subprojects}.to_json, headers: JSON_HEADERS
    assert_response :success
    assert_nil channel(channel_id)['subprojects']
  end

  test 'malformed channel ids are not found on read and bad requests on write' do
    [CAUSES_ARGUMENT_ERROR, CAUSES_CIPHER_ERROR].each do |channel_id|
      # Users can type channel ids into URLs, so reads 404.
      assert_not_found {get "/v3/channels/#{channel_id}"}

      post "/v3/channels/#{channel_id}", params: {}.to_json, headers: JSON_HEADERS
      assert_response :bad_request

      delete "/v3/channels/#{channel_id}"
      assert_response :bad_request
    end
  end

  # Sinatra's 404 carries X-Cascade: pass, which Rails raises as a routing error when exceptions are not rendered.
  private def assert_not_found(&request)
    assert_raises(ActionController::RoutingError, &request)
  end

  private def create_channel(value = {})
    post '/v3/channels', params: value.to_json, headers: JSON_HEADERS
    assert_response :moved_permanently
    response.location.split('/').last
  end

  private def channel(channel_id)
    get "/v3/channels/#{channel_id}"
    assert_response :ok
    JSON.parse(response.body)
  end

  private def cookie_storage_id
    storage_decrypt_id(CGI.unescape(cookies[storage_id_cookie_name]))
  end

  # Reads the row through the backend under test: a Sequel hash or a Project, both indexed by column.
  private def project_row(channel_id)
    Projects.get_by_ids(get_storage_id_and_project_id(channel_id).last).first
  end
end

class ChannelsApiActiveRecordTest < ChannelsApiTest
  self.projects_backend = :active_record
end
