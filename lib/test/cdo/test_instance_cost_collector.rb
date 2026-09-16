require_relative '../test_helper'
require 'cdo/instance_cost_collector'

class InstanceCostCollectorTest < Minitest::Test
  def setup
    @dimensions = {
      Host: 'test.example.net',
      InstanceType: 'm5.xlarge'
    }
    @collector = Cdo::InstanceCostCollector.new(
      cost_per_minute: 0.0032,
      namespace: 'App Server',
      interval: 60,
      resolution: 60,
      dimensions: @dimensions
    )
  end

  def teardown
    @collector.shutdown
    Cdo::Metrics.flush!
  end

  def test_snapshot_emits_cost_per_minute
    assert_equal({'ModeledComputeCostPerMinute' => 0.0032}, @collector.snapshot)
  end

  def test_snapshot_empty_when_cost_unknown
    collector = Cdo::InstanceCostCollector.new(
      cost_per_minute: nil,
      namespace: 'App Server',
      interval: 60,
      resolution: 60,
      dimensions: @dimensions
    )
    assert_empty collector.snapshot
  ensure
    collector.shutdown
  end

  def test_collect_publishes_with_none_unit
    Cdo::Metrics.expects(:put).with(
      'App Server', 'ModeledComputeCostPerMinute', 0.0032, @dimensions,
      storage_resolution: 60, unit: 'None'
    )

    @collector.send(:collect)
  end
end
