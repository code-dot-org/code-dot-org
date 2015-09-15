require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/files_api', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class AssetsTest < Minitest::Test

  def setup
    init_apis
  end

  def test_assets
    channel_id = create_channel(@channels)

    ensure_aws_credentials(channel_id)

    image_filename = 'dog.jpg'
    image_body = 'stub-image-contents'

    actual_image_info = JSON.parse(put(@assets, channel_id, image_filename, image_body, 'image/jpeg'))
    expected_image_info = {'filename' => image_filename, 'category' => 'image', 'size' => image_body.length}
    assert_fileinfo_equal(expected_image_info, actual_image_info)

    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'

    actual_sound_info = JSON.parse(put(@assets, channel_id, sound_filename, sound_body, 'audio/mpeg'))
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}
    assert_fileinfo_equal(expected_sound_info, actual_sound_info)

    file_infos = JSON.parse(list(@assets, channel_id))
    assert_fileinfo_equal(actual_image_info, file_infos[0])
    assert_fileinfo_equal(actual_sound_info, file_infos[1])

    get(@assets, channel_id, image_filename)
    assert_equal 'public, max-age=3600', @assets.last_response['Cache-Control']

    delete(@assets, channel_id, image_filename)
    assert @assets.last_response.successful?

    delete(@assets, channel_id, sound_filename)
    assert @assets.last_response.successful?

    # unsupported media type
    put(@assets, channel_id, 'filename.exe', 'stub-contents', 'application/x-msdownload')
    assert_equal 415, @assets.last_response.status

    # mismatched file extension and mime type
    put(@assets, channel_id, 'filename.jpg', 'stub-contents', 'application/gif')
    assert @assets.last_response.successful?
    delete(@assets, channel_id, 'filename.jpg')
    assert @assets.last_response.successful?

    # invalid files are not uploaded
    file_infos = JSON.parse(list(@assets, channel_id))
    assert_equal 0, file_infos.length

    delete(@assets, channel_id, 'nonexistent.jpg')
    assert @assets.last_response.successful?

    get(@assets, channel_id, 'nonexistent.jpg')
    assert @assets.last_response.not_found?

    delete_channel(@channels, channel_id)
  end

  def test_assets_copy_all
    src_channel_id = create_channel(@channels)
    dest_channel_id = create_channel(@channels)

    image_filename = 'dog.jpg'
    image_body = 'stub-image-contents'
    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}

    put(@assets, src_channel_id, image_filename, image_body, 'image/jpeg')
    put(@assets, src_channel_id, sound_filename, sound_body, 'audio/mpeg')
    copy_file_infos = JSON.parse(copy_all(@assets, src_channel_id, dest_channel_id))
    dest_file_infos = JSON.parse(list(@assets, dest_channel_id))

    assert_fileinfo_equal(expected_image_info, copy_file_infos[0])
    assert_fileinfo_equal(expected_sound_info, copy_file_infos[1])
    assert_fileinfo_equal(expected_image_info, dest_file_infos[0])
    assert_fileinfo_equal(expected_sound_info, dest_file_infos[1])

    delete(@assets, src_channel_id, image_filename)
    delete(@assets, src_channel_id, sound_filename)
    delete(@assets, dest_channel_id, image_filename)
    delete(@assets, dest_channel_id, sound_filename)
    delete_channel(@channels, src_channel_id)
    delete_channel(@channels, dest_channel_id)
  end

  def test_copy_all_with_no_src
    copy_all(@assets, nil, create_channel(@channels))
    assert @assets.last_response.bad_request?
  end

  def test_assets_auth
    owner_channel_id = create_channel(@channels)

    non_owner_assets = Rack::Test::Session.new(Rack::MockSession.new(FilesApi, "studio.code.org"))

    filename = 'dog.jpg'
    body = 'stub-image-contents'
    content_type = 'image/jpeg'

    put(@assets, owner_channel_id, filename, body, content_type)
    assert @assets.last_response.successful?, 'Owner can add a file'

    get(non_owner_assets, owner_channel_id, filename)
    assert non_owner_assets.last_response.successful?, 'Non-owner can read a file'

    put(non_owner_assets, owner_channel_id, filename, body, content_type)
    assert !non_owner_assets.last_response.successful?, 'Non-owner cannot write a file'

    delete(non_owner_assets, owner_channel_id, filename)
    assert !non_owner_assets.last_response.successful?, 'Non-owner cannot delete a file'

    # other_channel_id isn't owned by either user of the assets API.
    other_channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    other_channel_id = create_channel(other_channels)

    copy_all(@assets, other_channel_id, owner_channel_id)
    assert @assets.last_response.successful?, 'User who owns the destination channel can copy files.'

    copy_all(@assets, owner_channel_id, other_channel_id)
    assert !@assets.last_response.successful?, 'User who does not own the destination channel cannot copy files.'

    delete(@assets, owner_channel_id, filename)

    delete_channel(other_channels, other_channel_id)
  end

  # Methods below this line are test utilities, not actual tests
  private

  def init_apis
    @channels ||= Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))

    # Make sure the assets api has the same storage id cookie used by the channels api.
    @channels.get '/v3/channels'
    cookies = @channels.last_response.headers['Set-Cookie']
    assets_mock_session = Rack::MockSession.new(FilesApi, "studio.code.org")
    assets_mock_session.cookie_jar.merge(cookies)
    @assets ||= Rack::Test::Session.new(assets_mock_session)
  end

  def create_channel(channels)
    channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channels.last_response.location.split('/').last
  end

  def delete_channel(channels, channel_id)
    channels.delete "/v3/channels/#{channel_id}"
    assert channels.last_response.successful?
  end

  def ensure_aws_credentials(channel_id)
    list(@assets, channel_id)
    credentials_missing =
        !@assets.last_response.successful? &&
            @assets.last_response.body.index('Aws::Errors::MissingCredentialsError')
    credentials_msg =
        "Aws::Errors::MissingCredentialsError: if you are running these tests locally,\n"\
          "follow these instructions to configure your AWS credentials and try again:\n"\
          "http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html"
    flunk credentials_msg if credentials_missing
  end

  def list(assets, channel_id)
    assets.get("/v3/assets/#{channel_id}").body
  end

  def put(assets, channel_id, filename, body, content_type)
    assets.put("/v3/assets/#{channel_id}/#{filename}", body, 'CONTENT_TYPE' => content_type).body
  end

  def get(assets, channel_id, filename)
    assets.get "/v3/assets/#{channel_id}/#{filename}"
    assets.last_response.body
  end

  def delete(assets, channel_id, filename)
    assets.delete "/v3/assets/#{channel_id}/#{filename}"
  end

  def copy_all(assets, src_channel_id, dest_channel_id)
    assets.put("/v3/assets/#{dest_channel_id}?src=#{src_channel_id}").body
  end

  def assert_fileinfo_equal(expected, actual)
    assert_equal(Hash, actual.class)
    assert_equal(expected['filename'], actual['filename'])
    assert_equal(expected['category'], actual['category'])
    assert_equal(expected['size'], actual['size'])
  end

end
