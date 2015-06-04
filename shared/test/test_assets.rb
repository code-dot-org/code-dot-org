require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/assets_api', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class AssetsTest < Minitest::Unit::TestCase

  def create_channel
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channel_id = @channels.last_response.location.split('/').last
  end

  def delete_channel
    @channels.delete "/v3/channels/#{@channel_id}"
    assert @channels.last_response.successful?
  end

  def ensure_aws_credentials
    self.list
    credentials_missing =
        !@assets.last_response.successful? &&
        @assets.last_response.body.index('Aws::Errors::MissingCredentialsError')
    credentials_msg =
          "Aws::Errors::MissingCredentialsError: if you are running these tests locally,\n"\
          "follow these instructions to configure your AWS credentials and try again:\n"\
          "http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html"
    flunk credentials_msg if credentials_missing
  end

  def list
    @assets.get("/v3/assets/#{@channel_id}").body
  end

  def put(filename, body, content_type)
    @assets.put("/v3/assets/#{@channel_id}/#{filename}", body, 'CONTENT_TYPE' => content_type).body
  end

  def get(filename)
    @assets.get "/v3/assets/#{@channel_id}/#{filename}"
    @assets.last_response.body
  end

  def delete(filename)
    @assets.delete "/v3/assets/#{@channel_id}/#{filename}"
  end

  def assert_fileinfo_equal(expected, actual)
    assert_equal(Hash, actual.class)
    assert_equal(expected['filename'], actual['filename'])
    assert_equal(expected['category'], actual['category'])
    assert_equal(expected['size'], actual['size'])
  end

  def test_assets
    # The Assets API does not *currently* need to share a cookie jar with the Channels API,
    # but it may once we restrict put, delete and list operations to the channel owner.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @assets = Rack::Test::Session.new(Rack::MockSession.new(AssetsApi, "studio.code.org"))

    self.create_channel

    self.ensure_aws_credentials

    image_filename = 'dog.jpg'
    image_body = 'stub-image-contents'

    actual_image_info = JSON.parse(put(image_filename, image_body, 'image/jpeg'))
    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    assert_fileinfo_equal(expected_image_info, actual_image_info)

    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'

    actual_sound_info = JSON.parse(put(sound_filename, sound_body, 'audio/mpeg'))
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}
    assert_fileinfo_equal(expected_sound_info, actual_sound_info)

    file_infos = JSON.parse(self.list)
    assert_fileinfo_equal(actual_image_info, file_infos[0])
    assert_fileinfo_equal(actual_sound_info, file_infos[1])

    delete(image_filename)
    assert @assets.last_response.successful?

    delete(sound_filename)
    assert @assets.last_response.successful?

    # unsupported media type
    put('filename.exe', 'stub-contents', 'application/x-msdownload')
    assert_equal 415, @assets.last_response.status

    # mismatched file extension and mime type
    put('filename.jpg', 'stub-contents', 'application/gif')
    assert @assets.last_response.successful?
    delete('filename.jpg')
    assert @assets.last_response.successful?

    # invalid files are not uploaded
    file_infos = JSON.parse(self.list)
    assert_equal 0, file_infos.length

    delete('nonexistent.jpg')
    assert @assets.last_response.successful?

    get('nonexistent.jpg')
    assert @assets.last_response.not_found?

    self.delete_channel
  end

end
