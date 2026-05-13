require_relative '../../test_helper'
require 'cdo/aws/cloudwatch_logs'

class CdoCloudWatchLogsTest < Minitest::Test
  def setup
    Cdo::CloudWatchLogs.client = Aws::CloudWatchLogs::Client.new(stub_responses: true)
  end

  def test_put_log_events
    # Three log events with distict and ascending timestamps
    events = [
      {message: 'message1', timestamp: current_timestamp_in_milliseconds(0)},
      {message: 'message2', timestamp: current_timestamp_in_milliseconds(5)},
      {message: 'message3', timestamp: current_timestamp_in_milliseconds(10)}
    ]

    # Submit events to the buffer, out of order, via separate calls
    Cdo::CloudWatchLogs.put_log_event('log_group_name', 'log_stream_name', events[1])
    Cdo::CloudWatchLogs.put_log_events('log_group_name', 'log_stream_name', [events[0], events[2]])
    Cdo::CloudWatchLogs.flush!

    refute_empty Cdo::CloudWatchLogs.client.api_requests
    assert_equal(
      {
        log_group_name: 'log_group_name',
        log_stream_name: 'log_stream_name',
        log_events: events # expect events to have been resorted
      }, Cdo::CloudWatchLogs.client.api_requests.first[:params]
    )
  end

  def test_rejected_log_events
    Honeybadger.expects(:notify).once
    Cdo::CloudWatchLogs.client.stub_data(:put_log_events, rejected_log_events_info: {expired_log_event_end_index: 1})
    Cdo::CloudWatchLogs.put_log_event(
      'log_group_name',
      'log_stream_name',
      {message: 'message', timestamp: (Time.now.to_f * 1000).to_i}
    )
    Cdo::CloudWatchLogs.flush!
  end

  def current_timestamp_in_milliseconds(seconds_offset = 0)
    ((Time.now.to_f + seconds_offset) * 1000).to_i
  end
end
