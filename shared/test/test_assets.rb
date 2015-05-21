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
    #assert @channels.last_response.successful?
  end

  def list()
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

    imageFilename = 'dog.jpg'
    imageBody = 'stub-image-contents'

    actualImageInfo = JSON.parse(put(imageFilename, imageBody, 'image/jpeg'))
    expectedImageInfo = {'filename' =>  imageFilename, 'category' =>  'image', 'size' =>  imageBody.length}
    assert_fileinfo_equal(expectedImageInfo, actualImageInfo)

    soundFilename = 'woof.mp3'
    soundBody = 'stub-sound-contents'

    actualSoundInfo = JSON.parse(put(soundFilename, soundBody, 'audio/mpeg'))
    expectedSoundInfo = {'filename' =>  soundFilename, 'category' => 'audio', 'size' => soundBody.length}
    assert_fileinfo_equal(expectedSoundInfo, actualSoundInfo)

    fileInfos = JSON.parse(list())
    assert_fileinfo_equal(actualImageInfo, fileInfos[0])
    assert_fileinfo_equal(actualSoundInfo, fileInfos[1])

    delete(imageFilename)
    assert @assets.last_response.successful?

    delete(soundFilename)
    assert @assets.last_response.successful?

    # unsupported media type
    put('filename.exe', 'stub-contents', 'application/x-msdownload')
    assert_equal 415, @assets.last_response.status

    # mismatched file extension and mime type
    put('filename.jpg', 'stub-contents', 'application/gif')
    assert_equal 415, @assets.last_response.status

    # invalid files are not uploaded
    fileInfos = JSON.parse(list())
    assert_equal 0, fileInfos.length

    delete('nonexistent.jpg')
    assert @assets.last_response.successful?

    get('nonexistent.jpg')
    assert @assets.last_response.not_found?

    self.delete_channel
  end

end
