require_relative '../test_helper'
require 'cdo/puma_stats_collector'

module Puma; end unless defined?(Puma)

class PumaStatsCollectorTest < Minitest::Test
  def setup
    @collector = Cdo::PumaStatsCollector.new(
      namespace: 'App Server',
      interval: 0.1,
      resolution: 1,
      dimensions: {
        Environment: 'test',
        Host: 'test.example.net'
      }
    )
  end

  def teardown
    @collector.shutdown
    Cdo::Metrics.flush!
  end

  def test_snapshot_aggregates_worker_stats
    Puma.stubs(:stats_hash).returns(
      worker_status: [
        {last_status: {backlog: 0, running: 1, pool_capacity: 4, busy_threads: 1, max_threads: 5}},
        {last_status: {backlog: 2, running: 5, pool_capacity: 0, busy_threads: 5, max_threads: 5}}
      ],
      booted_workers: 2
    )

    expected = {
      'backlog' => 2,
      'running' => 6,
      'pool_capacity' => 4,
      'busy_threads' => 6,
      'max_threads' => 10,
      'booted_workers' => 2
    }

    assert_equal expected, @collector.snapshot
  end

  def test_publish_dual_dimensions
    Cdo::AwsWrapper::EC2.stubs(:instance_id).returns('i-12345678')

    Puma.stubs(:stats_hash).returns(
      worker_status: [
        {last_status: {backlog: 0, running: 1, pool_capacity: 4, busy_threads: 1, max_threads: 5}},
        {last_status: {backlog: 2, running: 5, pool_capacity: 0, busy_threads: 5, max_threads: 5}}
      ],
      booted_workers: 2
    )

    expected_metrics = {
      'backlog' => 2,
      'running' => 6,
      'pool_capacity' => 4,
      'busy_threads' => 6,
      'max_threads' => 10,
      'booted_workers' => 2
    }

    sequence = sequence('metrics')

    expected_metrics.each do |name, value|
      Cdo::Metrics.expects(:put).with(
        'App Server',
        name,
        value,
        {Environment: 'test', Host: 'test.example.net'},
        {storage_resolution: 1, unit: 'Count'}
      ).in_sequence(sequence)

      Cdo::Metrics.expects(:put).with(
        'App Server',
        name,
        value,
        {Environment: 'test', Host: 'test.example.net', InstanceId: 'i-12345678'},
        {storage_resolution: 1, unit: 'Count'}
      ).in_sequence(sequence)
    end

    @collector.send(:collect)
  end

  def test_start_is_idempotent
    task = Concurrent::TimerTask.new(execution_interval: 0.1) {}
    task.stubs(:with_observer).returns(task)
    task.stubs(:execute).returns(task)
    task.stubs(:running?).returns(true)

    Concurrent::TimerTask.stubs(:new).returns(task)

    task1 = @collector.start
    task2 = @collector.start
    assert_same task1, task2
  end

  def test_dynamic_resolution
    adhoc_collector = Cdo::PumaStatsCollector.new(
      namespace: 'App Server',
      resolution: 60,
      interval: 60,
      dimensions: {Environment: 'adhoc', Host: 'adhoc.example.net'}
    )

    Puma.stubs(:stats_hash).returns(worker_status: [], booted_workers: 0)
    Cdo::AwsWrapper::EC2.stubs(:instance_id).returns('i-adhoc')

    Cdo::Metrics.expects(:put).with(
      anything, anything, anything, anything,
      has_entry(storage_resolution: 60)
    ).at_least_once

    adhoc_collector.send(:collect)
  end
end
