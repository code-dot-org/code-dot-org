require_relative '../../test_helper'
require 'cdo/aws/metrics'

class CdoMetricsTest < Minitest::Test
  def setup
    Cdo::Metrics.client = Aws::CloudWatch::Client.new(stub_responses: true)
  end

  def test_put
    Cdo::Metrics.put('App Server/WorkerBoot', 1, Host: 'localhost.code.org')
    Cdo::Metrics.flush!
    refute_empty Cdo::Metrics.client.api_requests
    assert_equal(
      {
        namespace: 'App Server',
        metric_data: [
          metric_name: 'WorkerBoot',
          dimensions: [
            name: 'Host', value: 'localhost.code.org'
          ],
          value: 1.0
        ]
      }, Cdo::Metrics.client.api_requests.first[:params].tap {|p| p[:metric_data].first.delete(:timestamp)}
    )
  end
end
