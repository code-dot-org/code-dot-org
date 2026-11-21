require 'test_helper'
require 'testing/includes_metrics'

# Testing Docs for ActiveJob 6: https://api.rubyonrails.org/v6.0.6.1/classes/ActiveJob/TestHelper.html#method-i-perform_enqueued_jobs
class ApplicationJobTest < ActiveJob::TestCase
  # ApplicationJob is a base class for all jobs in the application.
  # Create a testable job class that inherits from ApplicationJob.
  class TestableJob < ApplicationJob
    def perform
      # No-op
    end
  end

  def populate_jobs_table(t, job_class)
    job_class = "job_class: #{job_class}"
    created_at = t - 1.hour
    job_rows = [
      {handler: "Failed Job, #{job_class}", run_at: t, created_at: created_at, updated_at: t, failed_at: t, last_error: 'Failed job error', locked_at: nil, locked_by: nil},
      {handler: "Running job, #{job_class}", run_at: t, created_at: created_at, updated_at: t, locked_at: t, locked_by: 'delayed_job.1', failed_at: nil, last_error: nil},
      {handler: "Waiting to start job, #{job_class}", run_at: t, created_at: created_at, updated_at: t, failed_at: nil, last_error: nil, locked_at: nil, locked_by: nil},
      {handler: "Distant future scheduled job, #{job_class}", run_at: t + 1.month, created_at: created_at, updated_at: t, failed_at: nil, last_error: nil, locked_at: nil, locked_by: nil},
    ]
    Delayed::Job.insert_all(job_rows)
  end

  # The cron runs the same SQL over a mysql2 client; this runs it over
  # ActiveRecord against the test database.
  QUERY = ->(sql) {Delayed::Job.connection.select_all(sql).to_a}

  setup do
    Delayed::Job.delete_all

    # The delayed_jobs.run_at column stores whole seconds.
    @t = Time.now.utc.change(usec: 0) - 10.seconds
    @now = @t + 10.seconds
    populate_jobs_table(@t, 'ApplicationJobTest::TestableJob')
    populate_jobs_table(@t, 'Some::OtherJob')

    @class_counts = {
      queued: 3,
      pending: 2,
      pending_high: 2,
      pending_low: 0,
      waiting_to_start: 1,
      running: 1,
      failed: 1,
      oldest_pending_age: 10,
      oldest_waiting_to_start_age: 10,
    }
  end

  def report(worker_count: nil)
    Cdo::ActiveJobQueueMetrics.report(QUERY, environment: CDO.rack_env, now: @now, worker_count: worker_count)
  end

  def environment
    [{name: 'Environment', value: CDO.rack_env}]
  end

  def values(metrics, dimensions)
    metrics.select {|metric| metric[:dimensions] == dimensions}.to_h {|metric| [metric[:metric_name], metric[:value]]}
  end

  test 'includes ActiveJobMetrics' do
    assert_includes ApplicationJob.ancestors, ActiveJobMetrics
  end

  test 'includes ActiveJobEnqueueRetry' do
    assert_includes ApplicationJob.ancestors, ActiveJobEnqueueRetry
  end

  test 'queue counts are grouped by job class' do
    assert_equal(
      {'ApplicationJobTest::TestableJob' => @class_counts, 'Some::OtherJob' => @class_counts},
      Cdo::ActiveJobQueueMetrics.counts_by_class(QUERY, now: @now)
    )
  end

  test 'job classes are matched exactly, not by prefix' do
    populate_jobs_table(@t, 'ApplicationJobTest::TestableJobber')
    counts = Cdo::ActiveJobQueueMetrics.counts_by_class(QUERY, now: @now)
    assert_equal 3, counts.fetch('ApplicationJobTest::TestableJob')[:queued]
    assert_equal 3, counts.fetch('ApplicationJobTest::TestableJobber')[:queued]
  end

  test 'a job class named in the arguments does not change the grouping' do
    Delayed::Job.delete_all
    Delayed::Job.insert_all([{handler: "job_data:\n  job_class: Real::Job\n  arguments:\n  - 'job_class: Fake::Job'\n", run_at: @t, created_at: @t, updated_at: @t}])
    assert_equal ['Real::Job'], Cdo::ActiveJobQueueMetrics.counts_by_class(QUERY, now: @now).keys
  end

  test 'report publishes queue-wide and per-class metrics' do
    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      assert_equal ApplicationJob::METRICS_NAMESPACE, namespace
      overall = values(metrics, environment)
      assert_equal 6, overall['QueuedJobCount']
      assert_equal 4, overall['WorkableQueuedJobCount']
      assert_equal 4, overall['PendingJobCount']
      assert_equal 2, overall['FailedJobCount']
      assert_equal 2, overall['WaitingToStartJobCount']
      assert_equal 2, overall['RunningJobCount']
      assert_equal 10, overall['OldestPendingJobAge']
      assert_equal 10, overall['OldestWaitingToStartJobAge']
      ['ApplicationJobTest::TestableJob', 'Some::OtherJob'].each do |job_class|
        per_class = values(metrics, environment + [{name: 'JobName', value: job_class}])
        assert_equal 8, per_class.size
        assert_equal 3, per_class['QueuedJobCount']
        assert_equal 2, per_class['PendingJobCount']
        assert_equal 1, per_class['RunningJobCount']
        assert_equal 1, per_class['FailedJobCount']
      end
      true
    end

    report
  end

  test 'report counts jobs with no ActiveJob class in the queue-wide metrics only' do
    Delayed::Job.insert_all([{handler: '--- !ruby/object:Delayed::PerformableMethod', run_at: @t, created_at: @t, updated_at: @t}])
    Cdo::Metrics.expects(:push).with do |_namespace, metrics|
      assert_equal 7, values(metrics, environment)['QueuedJobCount']
      job_names = metrics.flat_map {|metric| metric[:dimensions]}.select {|dimension| dimension[:name] == 'JobName'}.pluck(:value)
      assert_equal ['ApplicationJobTest::TestableJob', 'Some::OtherJob'], job_names.uniq.sort
      true
    end

    report
  end

  test 'report includes worker count and idle workers percent when given' do
    Cdo::Metrics.expects(:push).with do |_namespace, metrics|
      overall = values(metrics, environment)
      assert_equal 4, overall['WorkerCount']
      assert_equal 50.0, overall['PercentWorkersIdle']
      true
    end

    report(worker_count: 4)
  end

  test 'report omits worker metrics without a worker count' do
    Cdo::Metrics.expects(:push).with do |_namespace, metrics|
      assert_empty metrics.pluck(:metric_name) & %w[WorkerCount PercentWorkersIdle]
      true
    end

    report
  end

  test 'overall pending metrics distinguish priority bands without changing the environment total' do
    Delayed::Job.delete_all
    rows = [
      {priority: -1},
      {priority: 9},
      {priority: 10},
      {priority: 11, locked_at: @t, locked_by: 'worker'},
      {priority: 10, locked_at: @t - 5.hours, locked_by: 'abandoned-worker'},
      {priority: 9, run_at: @t + 1.day},
      {priority: 10, run_at: @t + 1.day},
      {priority: 9, failed_at: @t},
      {priority: 10, failed_at: @t},
    ].map do |attributes|
      {handler: 'job', priority: 0, run_at: @t, failed_at: nil, locked_at: nil, locked_by: nil, created_at: @t, updated_at: @t}.merge(attributes)
    end
    Delayed::Job.insert_all(rows)

    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      assert_equal ActiveJobMetrics::METRICS_NAMESPACE, namespace
      pending = metrics.select {|metric| metric[:metric_name] == 'PendingJobCount'}
      assert_equal 3, pending.length
      {nil => 5, 'high' => 2, 'low' => 3}.each do |band, count|
        dimensions = band ? environment + [{name: 'Priority', value: band}] : environment
        metric = pending.find {|candidate| candidate[:dimensions] == dimensions}
        assert_equal count, metric.fetch(:value)
        assert_equal 'Count', metric.fetch(:unit)
        assert_kind_of Time, metric.fetch(:timestamp)
      end
      true
    end

    report
  end

  test 'report publishes zeros for an empty band and after the queue drains' do
    published_metrics = []
    Cdo::Metrics.expects(:push).twice.with do |_namespace, metrics|
      published_metrics << metrics
      true
    end

    report
    Delayed::Job.delete_all
    report

    priority = ->(metrics) {metrics.select {|metric| metric[:dimensions].any? {|dimension| dimension[:name] == 'Priority'}}}
    assert_equal [4, 0], priority.call(published_metrics.first).pluck(:value)
    assert_equal [0, 0], priority.call(published_metrics.last).pluck(:value)
    assert(values(published_metrics.last, environment).values.all?(&:zero?))
    assert(published_metrics.last.none? {|metric| metric[:dimensions].any? {|dimension| dimension[:name] == 'JobName'}})
  end

  test 'enqueued jobs log EnqueuedCount, WaitTime, ExecutionTime and TotalTime' do
    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      next false unless metrics.any? {|metric| metric[:metric_name] == 'EnqueuedCount'}
      assert_equal ApplicationJob::METRICS_NAMESPACE, namespace
      assert_equal 1, metrics.size
      assert_equal(
        {value: 1, unit: 'Count', dimensions: environment + [{name: 'JobName', value: 'ApplicationJobTest::TestableJob'}]},
        metrics.first.slice(:value, :unit, :dimensions)
      )
      true
    end

    # before_perform metrics
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(WaitTime: is_a(Float)),
        includes_dimensions(:WaitTime, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob')
      )
    )

    # after_perform metrics
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(ExecutionTime: is_a(Float), TotalTime: is_a(Float)),
        includes_dimensions(:ExecutionTime, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:TotalTime, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob')
      )
    )

    perform_enqueued_jobs do
      TestableJob.perform_later
    end
  end

  test 'non-queued jobs log ExecutionTime and TotalTime only' do
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(ExecutionTime: is_a(Float), TotalTime: is_a(Float)),
        includes_dimensions(:ExecutionTime, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:TotalTime, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob')
      )
    )

    TestableJob.perform_now
  end

  test 'after_enqueue notifies Honeybadger and continues upon error' do
    Cdo::Metrics.stubs(:push)
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(EnqueuedCount: anything)
    ).raises('An error that should be squashed')

    Honeybadger.expects(:notify).once

    begin
      TestableJob.perform_later
    rescue => exception
      raise exception, 'Expected error to be squashed'
    end
  end

  test 'before_perform notifies Honeybadger and continues upon error' do
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(WaitTime: anything)
    ).raises('An error that should be squashed')

    # Stub other calls
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(EnqueuedCount: anything)
    )
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(ExecutionTime: anything, TotalTime: anything)
    )

    Honeybadger.expects(:notify).once

    perform_enqueued_jobs do
      TestableJob.perform_later
    rescue => exception
      raise exception, 'Expected error to be squashed'
    end
  end

  test 'after_perform notifies Honeybadger and continues upon error' do
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(ExecutionTime: anything, TotalTime: anything)
    ).raises('An error that should be squashed')

    # Stub other calls
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(EnqueuedCount: anything)
    )
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(WaitTime: anything)
    )

    Honeybadger.expects(:notify).once

    perform_enqueued_jobs do
      TestableJob.perform_later
    rescue => exception
      raise exception, 'Expected error to be squashed'
    end
  end
end
