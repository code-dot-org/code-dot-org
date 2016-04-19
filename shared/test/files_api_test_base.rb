require 'mocha/mini_test'
require 'files_api'
require 'channels_api'
require_relative 'test_helper'

class FilesApiTestBase < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(ChannelsApi.new(FilesApi), 'studio.code.org')
  end

  # Create a new channel
  # @return [String] the new encrypted channel ID
  def create_channel
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    last_response.location.split('/').last
  end

  # Delete the given channel, asserting that deletion is successful
  # @param [String] channel_id - the encrypted channel ID
  def delete_channel(channel_id)
    delete "/v3/channels/#{channel_id}"
    assert last_response.successful?
  end

end
