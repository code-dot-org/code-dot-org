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

  setup do
    Delayed::Job.delete_all

    # The delayed_jobs.run_at column stores whole seconds.
    @t = Time.now.utc.change(usec: 0) - 10.seconds
    @now = @t + 10.seconds
    populate_jobs_table(@t, 'ApplicationJobTest::TestableJob')
    populate_jobs_table(@t, 'Some::OtherJob')

    @my_counts = {
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
    @overall_counts = @my_counts.to_h do |key, value|
      [key, key.to_s.start_with?('oldest') ? value : value * 2]
    end
  end

  test 'includes ActiveJobMetrics' do
    assert_includes ApplicationJob.ancestors, ActiveJobMetrics
  end

  test 'includes ActiveJobEnqueueRetry' do
    assert_includes ApplicationJob.ancestors, ActiveJobEnqueueRetry
  end

  test 'queue counts cover every job' do
    assert_equal @overall_counts, Cdo::ActiveJobQueueMetrics.counts(ActiveJobMetrics.select_one, now: @now)
  end

  test 'queue counts for one job class' do
    assert_equal @my_counts, Cdo::ActiveJobQueueMetrics.counts(ActiveJobMetrics.select_one, now: @now, job_class: TestableJob.name)
  end

  test 'queue counts are zero for an empty queue' do
    Delayed::Job.delete_all
    counts = Cdo::ActiveJobQueueMetrics.counts(ActiveJobMetrics.select_one, now: @now)
    assert_equal(@overall_counts.transform_values {0}, counts)
  end

  test 'overall queue metrics include worker count and idle workers percent when given' do
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(WorkerCount: 4, RunningJobCount: @overall_counts[:running], PercentWorkersIdle: 50.0),
        includes_dimensions(:WorkerCount, Environment: CDO.rack_env),
        includes_dimensions(:RunningJobCount, Environment: CDO.rack_env),
        includes_dimensions(:PercentWorkersIdle, Environment: CDO.rack_env)
      )
    )

    Cdo::ActiveJobQueueMetrics.report_overall(ActiveJobMetrics.select_one, environment: CDO.rack_env, now: @now, worker_count: 4)
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
      environment = [{name: 'Environment', value: CDO.rack_env}]
      {nil => 5, 'high' => 2, 'low' => 3}.each do |band, count|
        dimensions = band ? environment + [{name: 'Priority', value: band}] : environment
        metric = pending.find {|candidate| candidate[:dimensions] == dimensions}
        assert_equal count, metric.fetch(:value)
        assert_equal 'Count', metric.fetch(:unit)
        assert_kind_of Time, metric.fetch(:timestamp)
      end
      true
    end

    Cdo::ActiveJobQueueMetrics.report_overall(ActiveJobMetrics.select_one, environment: CDO.rack_env, now: @now)
  end

  test 'pending priority metrics publish zero for an empty band and after the queue drains' do
    published_metrics = []
    Cdo::Metrics.expects(:push).twice.with do |namespace, metrics|
      assert_equal ActiveJobMetrics::METRICS_NAMESPACE, namespace
      published_metrics << metrics.select do |metric|
        metric[:metric_name] == 'PendingJobCount' && metric[:dimensions].any? {|dimension| dimension[:name] == 'Priority'}
      end
      true
    end

    Cdo::ActiveJobQueueMetrics.report_overall(ActiveJobMetrics.select_one, environment: CDO.rack_env, now: @now)
    Delayed::Job.delete_all
    Cdo::ActiveJobQueueMetrics.report_overall(ActiveJobMetrics.select_one, environment: CDO.rack_env, now: @now)

    assert_equal [4, 0], published_metrics.first.pluck(:value)
    assert_equal [0, 0], published_metrics.last.pluck(:value)
    assert_equal(['high', 'low'], published_metrics.last.map {|metric| metric[:dimensions].last[:value]})
  end

  test 'enqueued jobs log several metrics' do
    # Splitting this into two assertions because 'includes_metrics' can't match multiple metrics with the same name.
    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      environment = [{name: 'Environment', value: CDO.rack_env}]
      next false unless metrics.any? {|metric| metric[:metric_name] == 'QueuedJobCount' && metric[:dimensions] == environment}
      assert_equal ApplicationJob::METRICS_NAMESPACE, namespace
      overall = metrics.select {|metric| metric[:dimensions] == environment}.to_h {|metric| [metric[:metric_name], metric[:value]]}
      assert_equal @overall_counts[:queued], overall['QueuedJobCount']
      assert_equal @overall_counts[:pending], overall['WorkableQueuedJobCount']
      assert_equal @overall_counts[:pending], overall['PendingJobCount']
      assert_equal @overall_counts[:failed], overall['FailedJobCount']
      assert_equal @overall_counts[:waiting_to_start], overall['WaitingToStartJobCount']
      assert_equal @overall_counts[:running], overall['RunningJobCount']
      assert_in_delta 10, overall['OldestPendingJobAge'], 5
      assert_in_delta 10, overall['OldestWaitingToStartJobAge'], 5
      refute overall.key?('WorkerCount')
      refute overall.key?('PercentWorkersIdle')
      true
    end
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(
          QueuedJobCount: @my_counts[:queued],
          WorkableQueuedJobCount: @my_counts[:pending],
          FailedJobCount: @my_counts[:failed],
          PendingJobCount: @my_counts[:pending],
          WaitingToStartJobCount: @my_counts[:waiting_to_start],
          RunningJobCount: @my_counts[:running],
        ),
        includes_dimensions(:QueuedJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:WorkableQueuedJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:FailedJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:PendingJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:WaitingToStartJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:RunningJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:OldestPendingJobAge, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:OldestWaitingToStartJobAge, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
      )
    )

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
      includes_metrics(PendingJobCount: anything)
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
      includes_metrics(PendingJobCount: anything)
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
      includes_metrics(PendingJobCount: anything)
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
