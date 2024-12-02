require_relative '../../test_helper'
require 'cdo/aws/cloudwatch_logs'

class CdoCloudWatchLogsTest < Minitest::Test
  def setup
    Cdo::CloudWatchLogs.client = Aws::CloudWatchLogs::Client.new(stub_responses: true)
  end

  def test_put_log_events
    events = [
      {message: 'message1', timestamp: (Time.now.to_f * 1000).to_i},
      {message: 'message2', timestamp: (Time.now.to_f * 1000).to_i},
      {message: 'message3', timestamp: (Time.now.to_f * 1000).to_i}
    ]
    Cdo::CloudWatchLogs.put_log_event('log_group_name', 'log_stream_name', events[0])
    Cdo::CloudWatchLogs.put_log_events('log_group_name', 'log_stream_name', [events[1], events[2]])
    Cdo::CloudWatchLogs.flush!
    refute_empty Cdo::CloudWatchLogs.client.api_requests
    assert_equal(
      {
        log_group_name: 'log_group_name',
        log_stream_name: 'log_stream_name',
        log_events: events
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
end
