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

  def test_limits
    expected_limits = [[1200, 15], [2400, 60], [4800, 240]]
    actual_limits = Rack::Attack.limits Rack::Attack::MAX_TABLE_READS_PER_MIN
    assert_equal expected_limits, actual_limits, "Max table read limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = Rack::Attack.limits Rack::Attack::MAX_TABLE_WRITES_PER_MIN
    assert_equal expected_limits, actual_limits, "Max table write limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = Rack::Attack.limits Rack::Attack::MAX_PROPERTY_READS_PER_MIN
    assert_equal expected_limits, actual_limits, "Max property read limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = Rack::Attack.limits Rack::Attack::MAX_PROPERTY_WRITES_PER_MIN
    assert_equal expected_limits, actual_limits, "Max property write limits and periods are set correctly"
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
