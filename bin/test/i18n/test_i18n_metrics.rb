require_relative '../test_helper'
require_relative '../../i18n/metrics'
require 'cdo/aws/metrics'

class I18nMetricsTest < Minitest::Test
  def setup
    Cdo::Metrics.client = Aws::CloudWatch::Client.new(stub_responses: true)
    I18n::Metrics.stubs(:machine_id).returns('local_machine')
  end

  def expect_metric(name, value, dimensions)
    Cdo::Metrics.expects(:put_metric).with('I18n', {metric_name: name, value: value, dimensions: dimensions}).once
  end

  def test_report_runtime
    expect_metric(:Runtime, 1, [{name: 'MethodName', value: 'method'}, {name: 'SyncComp', value: 'component'}, {name: 'Environment', value: :test}, {name: 'MachineId', value: 'local_machine'}])
    I18n::Metrics.report_runtime('method', 'component') {1}
  end
end
