require 'mocha/mini_test'
require_relative 'test_helper'
require 'cdo/rack/attack'
require 'channels_api'
require 'tables_api'

class RackAttackTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  TABLE_NAME = 'stub_rack_attack_table'

  def build_rack_mock_session
    @session = Rack::MockSession.new(Rack::Attack.new(TablesApi), 'studio.code.org')
  end

  def setup
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channel_id = @channels.last_response.location.split('/').last
  end

  def teardown
    @channels.delete "/v3/channels/#{@channel_id}"
  end

  def test_rate_limit
    read_records
    assert last_response.ok?, '1st read succeeds'
    read_records
    assert last_response.ok?, '2nd read succeeds'
    read_records
  end

  def read_records
    get "/v3/shared-tables/#{@channel_id}/#{TABLE_NAME}"
  end
end
