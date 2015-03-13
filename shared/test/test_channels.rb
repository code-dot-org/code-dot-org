require 'minitest/autorun'
require 'rack/test'
require_relative '../rake/env.rb'
require_relative '../middleware/channels_api'

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
