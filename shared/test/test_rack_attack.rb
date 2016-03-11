require 'mocha/mini_test'
require_relative 'test_helper'
require 'channels_api'
require 'tables_api'
require 'properties_api'
require "fakeredis"
require "timecop"

# The redis cache is a class property of Rack::Attack. This means that
# the counts and time (as modified by timecop) used by each throttling rule
# (table reads, etc) for each channel id are shared across all tests.
#
# Today, all tests cases in shared/test use the same channel id because of the way
# pegasus DB transaction rollbacks are done. If we want to add multiple tests for each
# throttling rule, The simplest way to isolate them would be to obtain a different
# channel id in each test.

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
  OTHER_TABLE = 'other_table'
  PROPERTY_KEY = 'key'
  OTHER_KEY = 'other_key'

  def build_rack_mock_session
    # TODO(dave): chain middleware components like this in other middleware tests to reduce complexity.
    middleware = Rack::Attack.new(ChannelsApi.new(PropertiesApi.new(TablesApi)))
    @session = Rack::MockSession.new(middleware, 'studio.code.org')
  end

  def setup
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channel_id = last_response.location.split('/').last
  end

  def teardown
    delete "/v3/channels/#{@channel_id}"
  end

  # Test cases

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

  SUCCESSFUL = 200
  RATE_LIMITED = 429

  def test_table_read_limits_with_exponential_backoff
    Timecop.freeze rounded_time_now

    assert_read_records 1, SUCCESSFUL
    assert_read_records 2, SUCCESSFUL
    assert_read_records 3, SUCCESSFUL
    # don't increment the index here because throttled requests don't affect the counts.
    assert_read_records 3, RATE_LIMITED

    msg = 'Other tables in the same app count against the same rate limit'
    assert_read_records 3, RATE_LIMITED, msg, OTHER_TABLE

    Timecop.travel 16

    assert_read_records 4, SUCCESSFUL, '15s rate limit expires'
    assert_read_records 5, SUCCESSFUL
    assert_read_records 6, SUCCESSFUL
    assert_read_records 6, RATE_LIMITED, '15s rate limit takes effect a second time'

    Timecop.travel 16 # elapsed time: 32s
    assert_read_records 6, RATE_LIMITED, '60s rate limit takes effect'

    Timecop.travel 61 # elapsed time: 93s

    assert_read_records 7, SUCCESSFUL
    assert_read_records 8, SUCCESSFUL
    assert_read_records 9, SUCCESSFUL

    # avoid triggering 15s limit. elapsed time: 107s
    Timecop.travel 16

    assert_read_records 10, SUCCESSFUL
    assert_read_records 11, SUCCESSFUL
    assert_read_records 12, SUCCESSFUL

    assert_read_records 12, RATE_LIMITED, '60s rate limit takes effect a second time'

    Timecop.travel 61 # elapsed time: 168s

    assert_read_records 12, RATE_LIMITED, '240s rate limit takes effect'

    Timecop.travel 241

    assert_read_records 13, SUCCESSFUL, '240s rate limit expires'
  ensure
    Timecop.return
  end

  def test_table_write_limit_enforced
    id = create_record
    assert last_response.redirect?, '1st create succeeds'
    update_record id
    assert last_response.successful?, '1st update succeeds'
    delete_record id
    assert last_response.successful?, '1st delete succeeds'

    create_record
    assert_equal RATE_LIMITED, last_response.status, "2nd create is rate limited."
    update_record id
    assert_equal RATE_LIMITED, last_response.status, "2nd update is rate limited."
    delete_record id
    assert_equal RATE_LIMITED, last_response.status, "2nd delete is rate limited."

    create_record OTHER_TABLE
    assert_equal RATE_LIMITED, last_response.status, "create on other table is rate limited."
    update_record id, OTHER_TABLE
    assert_equal RATE_LIMITED, last_response.status, "update on other table is rate limited."
    delete_record id, OTHER_TABLE
    assert_equal RATE_LIMITED, last_response.status, "delete on other table is rate limited."

  end

  def test_property_limits_enforced
    set_key_value
    assert last_response.successful?, '1st property set succeeds'
    set_key_value
    assert last_response.successful?, '2nd property set succeeds'
    set_key_value
    assert last_response.successful?, '3rd property set succeeds'
    set_key_value
    assert_equal RATE_LIMITED, last_response.status, "4th property set is rate limited."

    set_key_value OTHER_KEY
    assert_equal RATE_LIMITED, last_response.status, "property set on other key is rate limited."

    get_key_value
    assert last_response.successful?, '1st property get succeeds'
    get_key_value
    assert last_response.successful?, '2nd property get succeeds'
    get_key_value
    assert last_response.successful?, '3rd property get succeeds'
    get_key_value
    assert_equal RATE_LIMITED, last_response.status, "4th property get is rate limited."

    get_key_value OTHER_KEY
    assert_equal RATE_LIMITED, last_response.status, "property get other key is rate limited."
  end

  # Helper methods

  # Rack::Attack::Cache computes expiry time in a way that may allow counters
  # to expire in a shorter amount of time than their corresponding period:
  #
  #     expiry_time = (Time.now.i % period) + period + 1
  #
  # Round off to the last time that was divisible by 4 minutes so that expiry times are
  # initially approximately equal to the length of the period.
  #
  # Do not go more than 15 minutes back or forward, or AWS will complain
  # with Aws::DynamoDB::Errors::InvalidSignatureException.
  def rounded_time_now
    now = Time.now
    rounded_min = now.min - (now.min % 4)
    Time.new(now.year, now.month, now.day, now.hour, rounded_min)
  end

  def table_path(table_name = TABLE_NAME)
    "/v3/shared-tables/#{@channel_id}/#{table_name}"
  end

  def content_type_json
    {'CONTENT_TYPE' => 'application/json;charset=utf-8'}
  end

  def create_record(table_name = TABLE_NAME)
    record = {name: "Alice", age: 7}
    post table_path(table_name), record.to_json, content_type_json
    last_response.location.split('/').last if last_response.location
  end

  def read_records(table_name = TABLE_NAME)
    get table_path(table_name)
  end

  def assert_read_records(index, expected_status, msg = nil, table_name = TABLE_NAME)
    read_records(table_name)
    assert_equal expected_status, last_response.status, "request #{index} expected #{expected_status} #{msg}"
  end

  def update_record(id, table_name = TABLE_NAME)
    record = {name: "Bob", age: 8}
    put "#{table_path(table_name)}/#{id}", record.to_json, content_type_json
  end

  def delete_record(id, table_name = TABLE_NAME)
    delete "#{table_path(table_name)}/#{id}"
  end

  def property_path(key = PROPERTY_KEY)
    "/v3/shared-properties/#{@channel_id}/#{key}"
  end

  def set_key_value(key = PROPERTY_KEY)
    post property_path(key), "value".to_json, content_type_json
  end

  def get_key_value(key = PROPERTY_KEY)
    get property_path(key)
  end
end
