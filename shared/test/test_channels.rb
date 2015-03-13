require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__

ENV['RACK_ENV'] = 'test'

class ChannelsTest < Minitest::Unit::TestCase
  include Rack::Test::Methods

  def app
    ChannelsApi
  end

  def test_create_channel
    post '/v3/channels', {'hello' => 'world'}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    assert last_response.redirection?
    follow_redirect!
    assert_equal JSON.parse(last_response.body)['hello'], 'world'
  end
end
