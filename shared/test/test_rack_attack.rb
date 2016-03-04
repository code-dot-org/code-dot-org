require 'mocha/mini_test'
require_relative 'test_helper'
require 'channels_api'
require 'tables_api'

# Allow 3 requests of each type in the first 15 seconds
REDUCED_RATE_LIMIT_FOR_TESTING = 3.0 / 60

CDO.stub(:max_table_reads_per_sec, REDUCED_RATE_LIMIT_FOR_TESTING) do
  CDO.stub(:max_table_writes_per_sec, REDUCED_RATE_LIMIT_FOR_TESTING) do
    CDO.stub(:max_property_reads_per_sec, REDUCED_RATE_LIMIT_FOR_TESTING) do
      CDO.stub(:max_property_writes_per_sec, REDUCED_RATE_LIMIT_FOR_TESTING) do
        require 'cdo/rack/attack'
      end
    end
  end
end

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

  # non-stubbed rate limits from CDO are used here
  def test_limits
    expected_limits = [[1200, 15], [2400, 60], [4800, 240]]
    actual_limits = Rack::Attack.limits CDO.max_table_reads_per_sec
    assert_equal expected_limits, actual_limits, "Max table read limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = Rack::Attack.limits CDO.max_table_writes_per_sec
    assert_equal expected_limits, actual_limits, "Max table write limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = Rack::Attack.limits CDO.max_property_reads_per_sec
    assert_equal expected_limits, actual_limits, "Max property read limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = Rack::Attack.limits CDO.max_property_writes_per_sec
    assert_equal expected_limits, actual_limits, "Max property write limits and periods are set correctly"

    expected_limits = [[3, 15], [6, 60], [12, 240]]
    actual_limits = Rack::Attack.limits REDUCED_RATE_LIMIT_FOR_TESTING
    assert_equal expected_limits, actual_limits, "Reduced rate limits for testing are set correctly"
  end

  def test_table_read_limit_enforced
    read_records
    assert last_response.ok?, '1st read succeeds'
    read_records
    assert last_response.ok?, '2nd read succeeds'
    read_records
    assert last_response.ok?, '3rd read succeeds'
    read_records
    assert_equal 429, last_response.status, "4th read is rate limited."
  end

  def test_table_write_limit_enforced
    id = create_record
    assert last_response.redirect?, '1st create succeeds'
    update_record id
    assert last_response.ok?, '1st update succeeds'
    delete_record id
    assert last_response.successful?, '1st delete succeeds'

    create_record
    assert_equal 429, last_response.status, "2nd create is rate limited."
    update_record id
    assert_equal 429, last_response.status, "2nd update is rate limited."
    delete_record id
    assert_equal 429, last_response.status, "2nd delete is rate limited."
  end

  # Helper methods

  def table_path
    "/v3/shared-tables/#{@channel_id}/#{TABLE_NAME}"
  end

  def content_type_json
    {'CONTENT_TYPE' => 'application/json;charset=utf-8'}
  end

  def create_record
    record = {name: "Alice", age: 7}
    post table_path, record.to_json, content_type_json
    last_response.location.split('/').last if last_response.location
  end

  def read_records
    get table_path
  end

  def update_record(id)
    record = {name: "Bob", age: 8}
    put "#{table_path}/#{id}", record.to_json, content_type_json
  end

  def delete_record(id)
    delete "#{table_path}/#{id}"
  end
end
