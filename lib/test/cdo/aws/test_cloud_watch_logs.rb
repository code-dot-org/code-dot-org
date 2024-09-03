require_relative '../../test_helper'
require 'cdo/aws/cloud_watch_logs'

class CdoCloudWatchLogsTest < Minitest::Test
  def setup
    Cdo::CloudWatchLogs.client = Aws::CloudWatchLogs::Client.new(stub_responses: true)
  end

  def test_put_log_events
    Cdo::CloudWatchLogs.put_log_events('log_group_name', 'log_stream_name', [{message: 'message'}])
    Cdo::CloudWatchLogs.flush!
    refute_empty Cdo::CloudWatchLogs.client.api_requests
    assert_equal(
      {
        log_group_name: 'log_group_name',
        log_stream_name: 'log_stream_name',
        log_events: [{message: 'message'}]
      }, Cdo::CloudWatchLogs.client.api_requests.first[:params]
    )
  end
end
