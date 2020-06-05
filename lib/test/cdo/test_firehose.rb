require_relative '../test_helper'
require 'cdo/firehose'

class TestFirehose < Minitest::Test
  def stub_firehose
    @firehose_mock = mock
    FirehoseClient.instance.instance_variable_set(:@rack_env, :unit_test)
    FirehoseClient.instance.instance_variable_set(:@firehose, @firehose_mock)
  end

  def unstub_firehose
    FirehoseClient.instance.instance_variable_set(:@rack_env, :test)
    FirehoseClient.instance.instance_variable_set(:@firehose, nil)
  end

  def setup
    stub_firehose
    DCDO.set(FIREHOSE_PUT_RECORD_BATCH_DCDO_KEY, true)
  end

  def teardown
    unstub_firehose
    DCDO.set(FIREHOSE_PUT_RECORD_BATCH_DCDO_KEY, false)
  end

  def test_instance_not_null
    assert FirehoseClient.instance
  end

  def test_put_record_batch_given_test_environment_should_do_nothing
    data = {test_key: 'key', test_value: 'value'}
    FirehoseClient.instance.instance_variable_set(:@rack_env, :test)

    @firehose_mock.expects(:put_record_batch).never
    Honeybadger.expects(:notify).never

    FirehoseClient.instance.put_record_batch('TEST_STREAM_NAME', [data])
  end

  # The :test and :development should not make actual calls to AWS.
  def test_put_record_batch_given_no_records_should_do_nothing
    @firehose_mock.expects(:put_record_batch).never
    Honeybadger.expects(:notify).never

    FirehoseClient.instance.put_record_batch('TEST_STREAM_NAME', [])
  end

  def test_put_record_batch_given_one_record_should_send_in_expected_format
    datas = [{test_key_1: 'value_1', test_value_2: 'value_2'}]
    test_stream_name = 'TEST_STREAM_NAME'
    actual_request = nil
    @firehose_mock.expects(:put_record_batch).with do |params|
      # Capture the request being sent so we can verify it has the expected arguments.
      actual_request = params
    end.returns(generate_valid_batch_response(datas))
    Honeybadger.expects(:notify).never

    FirehoseClient.instance.put_record_batch(test_stream_name, datas)

    assert_expected_put_record_batch_request(test_stream_name, datas, actual_request)
  end

  def test_put_record_batch_given_999_records_should_send_smaller_batches
    datas = []
    999.times do |_|
      datas << {test_key_1: 'value_1', test_value_2: 'value_2'}
    end
    test_stream_name = 'TEST_STREAM_NAME'
    # We expect multiple requests, so store all of them.
    actual_requests = []
    @firehose_mock.expects(:put_record_batch).with do |params|
      # Capture the request being sent so we can verify it has the expected arguments.
      actual_requests << params
    end.returns(generate_valid_batch_response(datas)).twice
    Honeybadger.expects(:notify).never

    FirehoseClient.instance.put_record_batch(test_stream_name, datas)

    # The firehose API has a batch limit of 500, so we need to verify that our
    # calls to the API do no exceed 500.
    assert_equal(500, actual_requests[0][:records].size)
    assert_equal(499, actual_requests[1][:records].size)
  end

  # Delete this test once the FIREHOSE_PUT_RECORD_BATCH_DCDO_KEY experiment ends
  def test_put_record_given_disabled_experiment_should_use_old_put_record_api
    DCDO.set(FIREHOSE_PUT_RECORD_BATCH_DCDO_KEY, false)
    data = {test_key_1: 'value_1', test_value_2: 'value_2'}
    test_stream_name = 'TEST_STREAM_NAME'
    actual_request = nil
    # We can verify the old code is being used because it uses the put_record API
    @firehose_mock.expects(:put_record).with do |params|
      # Capture the request being sent so we can verify it has the expected arguments.
      actual_request = params
    end
    Honeybadger.expects(:notify).never

    FirehoseClient.instance.put_record(test_stream_name, data)

    assert(actual_request)
    # the old code could only send data to the analysis.events stream.
    assert_equal(ANALYSIS_EVENTS_STREAM_NAME, actual_request[:delivery_stream_name])
    record = actual_request[:record]
    assert(record)
    assert(valid_json?(record[:data]), "#{record[:data]} is not valid JSON")
    actual_data = JSON.parse(record[:data])
    assert_equal(data[:test_key_1], actual_data[:test_key_1.to_s])
  end

  def test_put_record_given_data_should_send_it
    data = {test_key_1: 'value_1', test_value_2: 'value_2'}
    test_stream_name = 'TEST_STREAM_NAME'
    actual_request = nil
    # Our put_record wrapper method calls the put_record_batch API with one record.
    @firehose_mock.expects(:put_record_batch).with do |params|
      # Capture the request being sent so we can verify it has the expected arguments.
      actual_request = params
    end.returns(generate_valid_batch_response([data]))
    Honeybadger.expects(:notify).never

    FirehoseClient.instance.put_record(test_stream_name, data)

    assert_expected_put_record_batch_request(test_stream_name, [data], actual_request)
  end

  private

  # creates a mock success response for the put_batch_record API
  def generate_valid_batch_response(datas)
    request_responses = []
    datas.each do |_|
      request_response = mock
      request_response.stubs(:error_code).returns(nil)
      request_responses << request_response
    end
    batch_response = mock
    batch_response.stubs(:request_responses).returns(request_responses)
    batch_response
  end

  def valid_json?(json)
    return false unless json.is_a?(String)
    JSON.parse(json)
    true
  rescue JSON::ParserError => _
    return false
  end

  # Asserts that the given stream_name and data are found in the correct format when passed to the
  # AWS Firehose put_record_batch API.
  def assert_expected_put_record_batch_request(expected_stream_name, expected_datas, actual_request)
    # The firehose API expects the request format to be:
    # {
    #   delivery_stream_name: 'some_firehose_stream_name',
    #   records: [
    #     {
    #       data: '{ "json_key": "json_value"}'
    #     }
    #   ]
    # }
    assert(actual_request)
    assert_equal(expected_stream_name, actual_request[:delivery_stream_name])
    records = actual_request[:records]
    assert(records)
    assert_equal(expected_datas.size, records.size)
    assert(valid_json?(records[0][:data]), "#{records[0][:data]} is not valid JSON")
    actual_data = JSON.parse(records[0][:data])
    # Verify the data we gave it is present in the request we send.
    assert_equal(expected_datas[0][:test_key_1], actual_data[:test_key_1.to_s])
    assert_equal(expected_datas[0][:test_value_2], actual_data[:test_value_2.to_s])
  end
end
