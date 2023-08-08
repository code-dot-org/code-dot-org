require_relative '../test_helper'
require_relative '../../i18n/metrics'
require 'cdo/aws/metrics'
require 'benchmark'

class I18nMetricsTest < Minitest::Test
  def setup
    Cdo::Metrics.client = Aws::CloudWatch::Client.new(stub_responses: true)
    I18n::Metrics.stubs(:machine_id).returns('local_machine')
  end

  def expect_metric(name, value, dimensions, unit)
    Cdo::Metrics.expects(:put_metric).with('I18n', {metric_name: name, value: value, dimensions: dimensions, unit: unit}).once
  end

  def test_report_runtime
    test_time = Benchmark.realtime {sleep 1.second}
    expect_metric(:Runtime, test_time.in_milliseconds.to_i, [{name: 'MethodName', value: 'method'}, {name: 'SyncComp', value: 'component'}, {name: 'Environment', value: :test}, {name: 'MachineId', value: 'local_machine'}], 'Milliseconds')
    I18n::Metrics.report_runtime('method', 'component') {sleep 1.second}
  end
end
