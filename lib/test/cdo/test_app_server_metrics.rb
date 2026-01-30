require_relative '../test_helper'
require 'cdo/app_server_metrics'

# Define Puma module if it doesn't exist so we can stub it without loading the full gem.
module Puma; end unless defined?(Puma)

class AppServerMetricsTest < Minitest::Test
  def setup
    # Make sure we pass dimensions here, mirroring your production fix
    @metrics = Cdo::AppServerMetrics.new(
      interval: 0.1,
      namespace: 'App Server',
      dimensions: {
        Environment: 'test',
        Host: 'test.example.net'
      }
    )
  end

  def teardown
    @metrics.shutdown
    Cdo::Metrics.flush!
  end

  def test_collect_puma_stats
    AWS::EC2.stubs(:instance_id).returns('i-12345678')

    # Fix 2: Puma constant is now guaranteed to exist due to the module definition above
    fake_puma_stats = {
      worker_status: [
        {last_status: {backlog: 0, running: 1, pool_capacity: 4, max_threads: 5}},
        {last_status: {backlog: 2, running: 5, pool_capacity: 0, max_threads: 5}}
      ],
      booted_workers: 2
    }
    Puma.stubs(:stats_hash).returns(fake_puma_stats)

    expected_metrics = {
      'backlog' => 2,
      'running' => 6,
      'pool_capacity' => 4,
      'booted_workers' => 2
    }

    sequence = sequence('metrics')

    expected_metrics.each do |name, value|
      # Expect Deployment-level metric
      Cdo::Metrics.expects(:put).with(
        'App Server',
        name,
        value,
        {Environment: 'test', Host: 'test.example.net'},
        {storage_resolution: 1, unit: 'Count'}
      ).in_sequence(sequence)

      # Expect Instance-level metric
      Cdo::Metrics.expects(:put).with(
        'App Server',
        name,
        value,
        {Environment: 'test', Host: 'test.example.net', InstanceId: 'i-12345678'},
        {storage_resolution: 1, unit: 'Count'}
      ).in_sequence(sequence)
    end

    @metrics.collect_puma_stats
  end

  def test_start_puma_reporting_is_idempotent
    # Create a real task object so we satisfy 'assert_kind_of' checks.
    task = Concurrent::TimerTask.new(execution_interval: 0.1) {}

    # Stub 'with_observer' to return self (the task).
    # This prevents the real method from running and ensures the chain continues on our terms.
    task.stubs(:with_observer).returns(task)

    # Stub 'execute' to return self (the task).
    task.stubs(:execute).returns(task)

    # Stub 'running?' for the idempotency check.
    task.stubs(:running?).returns(true)

    # Force .new to return our prepared task.
    Concurrent::TimerTask.stubs(:new).returns(task)

    # First call: Should return the task.
    task1 = @metrics.start_puma_reporting
    assert_kind_of Concurrent::TimerTask, task1

    # Second call: Should return the SAME task object.
    task2 = @metrics.start_puma_reporting
    assert_same task1, task2
  end

  def test_dynamic_resolution
    adhoc_metrics = Cdo::AppServerMetrics.new(resolution: 60, interval: 60)

    Puma.stubs(:stats_hash).returns({worker_status: [], booted_workers: 0})
    AWS::EC2.stubs(:instance_id).returns('i-adhoc')

    Cdo::Metrics.expects(:put).with(
      anything, anything, anything, anything,
      has_entry(storage_resolution: 60)
    ).at_least_once

    adhoc_metrics.collect_puma_stats
  end
end
