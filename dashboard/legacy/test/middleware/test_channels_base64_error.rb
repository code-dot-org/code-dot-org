require_relative 'middleware_test_helper'
require 'mocha/mini_test'
require_relative '../../middleware/channels_api'

CAUSES_ARGUMENTERROR = "bT0zAyBvk".freeze
CAUSES_CIPHERERROR = "IMALITTLETEAPOTSHORTANDSTOUT".freeze

class ChannelsBase64ErrorTest < Minitest::Test
  include SetupTest

  def setup
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
  end

  def test_base64_error
    # test all the cases with a channel ID that will raise ArgumentError internally when trying to base64 decode
    run_test_cases CAUSES_ARGUMENTERROR
    # test all the cases with a channel ID that will raise OpenSSL::Cipher::CipherError internally when trying to base64 decode
    run_test_cases CAUSES_CIPHERERROR
  end

  private

  def run_test_cases(channel_id)
    @channels.get "/v3/channels/#{channel_id}"
    assert_equal 400, @channels.last_response.status

    @channels.post "/v3/channels/#{channel_id}", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert_equal 400, @channels.last_response.status

    @channels.delete "/v3/channels/#{channel_id}"
    assert_equal 400, @channels.last_response.status
  end
end
