require 'mocha/mini_test'
require_relative 'test_helper'
require 'channels_api'
require 'tables_api'
require 'properties_api'
require "fakeredis"
require "timecop"
require_relative 'spy_newrelic_agent'

# The cache is a class property of Rack::Attack. This means that
# the counts and time (as modified by timecop) used by each throttling rule
# (table reads, etc) for each channel id are shared across all tests.
#
# Today, all tests cases in shared/test use the same channel id because of the way
# pegasus DB transaction rollbacks are done. If we want to add multiple tests for each
# throttling rule, The simplest way to isolate them would be to obtain a different
# channel id in each test.

# Allow 3 requests of each type in the first 15 seconds
REDUCED_RATE_LIMIT_FOR_TESTING = 3.0 / 60

CDO.max_table_reads_per_sec = REDUCED_RATE_LIMIT_FOR_TESTING
CDO.max_table_writes_per_sec = REDUCED_RATE_LIMIT_FOR_TESTING
CDO.max_property_reads_per_sec = REDUCED_RATE_LIMIT_FOR_TESTING
CDO.max_property_writes_per_sec = REDUCED_RATE_LIMIT_FOR_TESTING

require 'cdo/rack/attack'

class RackAttackTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  TABLE_NAME = 'stub_rack_attack_table'
  OTHER_TABLE = 'other_table'
  PROPERTY_KEY = 'key'
  OTHER_KEY = 'other_key'

  @@cache_store = Rack::Attack::StoreProxy::RedisStoreProxy.new(Redis.new(url: 'redis://localhost:6379'))
  @@updater = RackAttackConfigUpdater.new.start(@@cache_store)

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

  # non-stubbed rate limits from the real CDO config are used here
  def test_limits
    max_table_reads_per_sec = 20
    max_table_writes_per_sec = 40
    max_property_reads_per_sec = 40
    max_property_writes_per_sec = 40

    expected_limits = [[1200, 15], [2400, 60], [4800, 240]]
    actual_limits = @@updater.limits max_table_reads_per_sec
    assert_equal expected_limits, actual_limits, "Max table read limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = @@updater.limits max_table_writes_per_sec
    assert_equal expected_limits, actual_limits, "Max table write limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = @@updater.limits max_property_reads_per_sec
    assert_equal expected_limits, actual_limits, "Max property read limits and periods are set correctly"

    expected_limits = [[2400, 15], [4800, 60], [9600, 240]]
    actual_limits = @@updater.limits max_property_writes_per_sec
    assert_equal expected_limits, actual_limits, "Max property write limits and periods are set correctly"

    expected_limits = [[3, 15], [6, 60], [12, 240]]
    actual_limits = @@updater.limits REDUCED_RATE_LIMIT_FOR_TESTING
    assert_equal expected_limits, actual_limits, "Reduced rate limits for testing are set correctly"
  end

  SUCCESSFUL = 200
  FORBIDDEN = 403
  RATE_LIMITED = 429

  def test_table_read_limits_with_exponential_backoff_and_logging
    Timecop.freeze rounded_time_now
    CDO.stub(:newrelic_logging, true) do
      assert_read_records 1, SUCCESSFUL
      assert_read_records 2, SUCCESSFUL
      assert_read_records 3, SUCCESSFUL
      # don't increment the index here because throttled requests don't affect the counts.
      assert_read_records 3, RATE_LIMITED
      assert_throttle_custom_event 1, 'shared-tables/reads/15', count: 4, period: 15, limit: 3
      assert_throttle_custom_metric 1, 'shared-tables_reads'

      msg = 'Other tables in the same app count against the same rate limit'
      assert_read_records 3, RATE_LIMITED, msg, OTHER_TABLE
      assert_throttle_custom_event 2, 'shared-tables/reads/15', count: 5, period: 15, limit: 3
      assert_throttle_custom_metric 2, 'shared-tables_reads'

      Timecop.travel 16

      assert_read_records 4, SUCCESSFUL, '15s rate limit expires'
      assert_read_records 5, SUCCESSFUL
      assert_read_records 6, SUCCESSFUL
      assert_read_records 6, RATE_LIMITED, '15s rate limit takes effect a second time'

      Timecop.travel 16 # elapsed time: 32s
      assert_read_records 6, RATE_LIMITED, '60s rate limit takes effect'
      assert_throttle_custom_event 4, 'shared-tables/reads/60', count: 7, period: 60, limit: 6
      assert_throttle_custom_metric 4, 'shared-tables_reads'

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
      assert_throttle_custom_event 6, 'shared-tables/reads/240', count: 13, period: 240, limit: 12
      assert_throttle_custom_metric 6, 'shared-tables_reads'

      Timecop.travel 241

      assert_read_records 13, SUCCESSFUL, '240s rate limit expires'
    end

    # Now test that a dynamic update to the rate limit is enforced correctly.
    Timecop.freeze rounded_time_now + 60
    _test_table_dynamic_rate_limit_enforced
  ensure
    Timecop.return
  end

  # Helper function for test_table_read_limits_with_exponential_backoff to test
  # dynamic rate limit updates.
  def _test_table_dynamic_rate_limit_enforced
    # Double the allowed rate in the dynamic configuration and make sure
    # that we can read twice as many rows as in the previous test before being
    # rate limited.
    DCDO.set('max_table_reads_per_sec', 6.0 / 60)
    DCDO.update_cache_for_test  # Make sure the updated limit applies immediately.

    Timecop.freeze rounded_time_now
    assert_read_records 1, SUCCESSFUL
    assert_read_records 2, SUCCESSFUL
    assert_read_records 3, SUCCESSFUL
    assert_read_records 4, SUCCESSFUL
    assert_read_records 5, SUCCESSFUL
    assert_read_records 6, SUCCESSFUL

    # don't increment the index here because throttled requests don't affect the counts.
    assert_read_records 6, RATE_LIMITED
  end

  def test_blacklist
    blacklist = "foo,#{@channel_id},bar"
    DCDO.set('table_and_property_blacklist', blacklist)
    DCDO.update_cache_for_test  # Make sure the updated blacklist applies immediately.

    assert_read_records 1, FORBIDDEN, 'requests from blacklisted apps are forbidden'

    DCDO.set('table_and_property_blacklist', nil)
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

  def assert_throttle_custom_event(index, throttle_name, count: nil, period: nil, limit: nil)
    # Filter out events from other test cases.
    events = NewRelic::Agent.get_events %r{^RackAttackRequestThrottled$}
    assert_equal index, events.length, "custom events recorded: #{index}"
    last_event = events.last
    assert_equal @channel_id, last_event.last[:encrypted_channel_id], "custom event #{index} encrypted_channel_id"
    assert_equal throttle_name, last_event.last[:throttle_name], "custom event #{index} throttle_name"
    assert_equal count, last_event.last[:throttle_data_count], "custom event #{index} throttle_data_count" if count
    assert_equal period, last_event.last[:throttle_data_period], "custom event #{index} throttle_data_period" if period
    assert_equal limit, last_event.last[:throttle_data_limit], "custom event #{index} throttle_data_limit" if limit
  end

  def assert_throttle_custom_metric(index, throttle_type, expected_value = 1)
    # Filter out metrics from other test cases.
    metrics = NewRelic::Agent.get_metrics %r{^Custom/RackAttackRequestThrottled}
    assert_equal index, metrics.length, "custom metrics recorded: #{index}"
    last_metric = metrics.last
    expected_metric_name = "Custom/RackAttackRequestThrottled/#{throttle_type}"
    assert_equal expected_metric_name, last_metric.first, "custom metric #{index} name"
    assert_equal expected_value, last_metric.last, "custom metric #{index} value"
  end
end
