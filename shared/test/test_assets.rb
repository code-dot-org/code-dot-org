require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/files_api', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class AssetsTest < Minitest::Unit::TestCase

  def setup
    init_apis
  end

  def test_assets
    channel_id = create_channel

    ensure_aws_credentials(channel_id)

    image_filename = 'dog.jpg'
    image_body = 'stub-image-contents'

    actual_image_info = JSON.parse(put(channel_id, image_filename, image_body, 'image/jpeg'))
    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    assert_fileinfo_equal(expected_image_info, actual_image_info)

    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'

    actual_sound_info = JSON.parse(put(channel_id, sound_filename, sound_body, 'audio/mpeg'))
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}
    assert_fileinfo_equal(expected_sound_info, actual_sound_info)

    file_infos = JSON.parse(list(channel_id))
    assert_fileinfo_equal(actual_image_info, file_infos[0])
    assert_fileinfo_equal(actual_sound_info, file_infos[1])

    delete(channel_id, image_filename)
    assert @assets.last_response.successful?

    delete(channel_id, sound_filename)
    assert @assets.last_response.successful?

    # unsupported media type
    put(channel_id, 'filename.exe', 'stub-contents', 'application/x-msdownload')
    assert_equal 415, @assets.last_response.status

    # mismatched file extension and mime type
    put(channel_id, 'filename.jpg', 'stub-contents', 'application/gif')
    assert @assets.last_response.successful?
    delete(channel_id, 'filename.jpg')
    assert @assets.last_response.successful?

    # invalid files are not uploaded
    file_infos = JSON.parse(list(channel_id))
    assert_equal 0, file_infos.length

    delete(channel_id, 'nonexistent.jpg')
    assert @assets.last_response.successful?

    get(channel_id, 'nonexistent.jpg')
    assert @assets.last_response.not_found?

    delete_channel(channel_id)
  end

  def test_assets_copy_all
    src_channel_id = create_channel
    dest_channel_id = create_channel

    image_filename = 'dog.jpg'
    image_body = 'stub-image-contents'
    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}

    put(src_channel_id, image_filename, image_body, 'image/jpeg')
    put(src_channel_id, sound_filename, sound_body, 'audio/mpeg')
    copy_file_infos = JSON.parse(copy_all(src_channel_id, dest_channel_id))
    dest_file_infos = JSON.parse(list(dest_channel_id))

    assert_fileinfo_equal(expected_image_info, copy_file_infos[0])
    assert_fileinfo_equal(expected_sound_info, copy_file_infos[1])
    assert_fileinfo_equal(expected_image_info, dest_file_infos[0])
    assert_fileinfo_equal(expected_sound_info, dest_file_infos[1])

    delete(src_channel_id, image_filename)
    delete(src_channel_id, sound_filename)
    delete(dest_channel_id, image_filename)
    delete(dest_channel_id, sound_filename)
    delete_channel(src_channel_id)
    delete_channel(dest_channel_id)
  end

  def test_copy_all_with_no_src
    copy_all(nil, create_channel)
    assert @assets.last_response.bad_request?
  end

  # Methods below this line are test utilities, not actual tests
  private

  def init_apis
    # The Assets API does not *currently* need to share a cookie jar with the Channels API,
    # but it may once we restrict put, delete and list operations to the channel owner.
    @channels ||= Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @assets ||= Rack::Test::Session.new(Rack::MockSession.new(FilesApi, "studio.code.org"))
  end

  def create_channel
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channels.last_response.location.split('/').last
  end

  def delete_channel(channel_id)
    @channels.delete "/v3/channels/#{channel_id}"
    assert @channels.last_response.successful?
  end

  def ensure_aws_credentials(channel_id)
    list(channel_id)
    credentials_missing =
        !@assets.last_response.successful? &&
            @assets.last_response.body.index('Aws::Errors::MissingCredentialsError')
    credentials_msg =
        "Aws::Errors::MissingCredentialsError: if you are running these tests locally,\n"\
          "follow these instructions to configure your AWS credentials and try again:\n"\
          "http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html"
    flunk credentials_msg if credentials_missing
  end

  def list(channel_id)
    @assets.get("/v3/assets/#{channel_id}").body
  end

  def put(channel_id, filename, body, content_type)
    @assets.put("/v3/assets/#{channel_id}/#{filename}", body, 'CONTENT_TYPE' => content_type).body
  end

  def get(channel_id, filename)
    @assets.get "/v3/assets/#{channel_id}/#{filename}"
    @assets.last_response.body
  end

  def delete(channel_id, filename)
    @assets.delete "/v3/assets/#{channel_id}/#{filename}"
  end

  def copy_all(src_channel_id, dest_channel_id)
    @assets.put("/v3/assets/#{dest_channel_id}?src=#{src_channel_id}").body
  end

  def assert_fileinfo_equal(expected, actual)
    assert_equal(Hash, actual.class)
    assert_equal(expected['filename'], actual['filename'])
    assert_equal(expected['category'], actual['category'])
    assert_equal(expected['size'], actual['size'])
  end

end
