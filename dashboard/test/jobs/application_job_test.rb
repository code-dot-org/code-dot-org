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

  class FailingJob < ApplicationJob
    def perform
      raise 'job failed'
    end
  end

  class SwallowingJob < ApplicationJob
    rescue_from(StandardError) do
      # Swallows the failure, as a job with its own error reporting does.
    end

    def perform
      raise 'job failed'
    end
  end

  class AbortedJob < ApplicationJob
    before_perform {throw :abort}

    def perform
      # No-op; never reached.
    end
  end

  class SkippedJob < ApplicationJob
    around_perform do |_job, _block|
      # Skips the job by never calling the block.
    end

    def perform
      # No-op; never reached.
    end
  end

  class RetriedJob < ApplicationJob
    retry_on StandardError, wait: 0, attempts: 2

    def perform
      raise 'first attempt failed' if executions == 1
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
    @t = Time.now.utc.change(usec: 0) + 1.day
    populate_jobs_table(@t, 'ApplicationJobTest::TestableJob')
    populate_jobs_table(@t, 'Some::OtherJob')

    @t_offset = 10.seconds

    # Time starts 10 seconds after creating our test jobs
    ActiveJobMetrics.stubs(:_now_utc).returns(@t + @t_offset)

    @expected_my_failed_count = 1
    @expected_my_waiting_to_start_count = 1
    @expected_my_pending_count = 2
    @expected_my_workable_count = 2
    @expected_my_queued_count = 3
    @expected_my_running_count = 1

    @expected_failed_count = @expected_my_failed_count * 2
    @expected_waiting_to_start_count = @expected_my_waiting_to_start_count * 2
    @expected_pending_count = @expected_my_pending_count * 2
    @expected_workable_count = @expected_my_workable_count * 2
    @expected_queued_count = @expected_my_queued_count * 2
    @expected_running_count = @expected_my_running_count * 2
  end

  test 'includes ActiveJobMetrics' do
    assert_includes ApplicationJob.ancestors, ActiveJobMetrics
  end

  test 'includes ActiveJobEnqueueRetry' do
    assert_includes ApplicationJob.ancestors, ActiveJobEnqueueRetry
  end

  test 'oldest_pending_job_age_s' do
    assert_in_delta 10.0, ActiveJobMetrics.oldest_pending_job_age_s, 0.01
    assert_in_delta 10.0, ApplicationJob.new.oldest_pending_job_age_s, 0.01
  end

  test 'oldest_waiting_to_start_job_age_s' do
    assert_in_delta 10.0, ActiveJobMetrics.oldest_waiting_to_start_job_age_s, 0.01
    assert_in_delta 10.0, ApplicationJob.new.oldest_waiting_to_start_job_age_s, 0.01
  end

  test 'queued_jobs.count returns the number of queued jobs' do
    assert_equal @expected_queued_count, ActiveJobMetrics.queued_jobs.count
    assert_equal @expected_my_queued_count, ApplicationJob.new.queued_jobs.count
  end

  test 'pending_jobs.count returns the number of pending jobs' do
    assert_equal @expected_pending_count, ActiveJobMetrics.pending_jobs.count
    assert_equal @expected_my_pending_count, ApplicationJob.new.pending_jobs.count
  end

  test 'failed_jobs.count returns the number of failed jobs' do
    assert_equal @expected_failed_count, ActiveJobMetrics.failed_jobs.count
    assert_equal @expected_my_failed_count, ApplicationJob.new.failed_jobs.count
  end

  test 'workable_queued_jobs.count returns the number of workable jobs' do
    assert_equal @expected_workable_count, ActiveJobMetrics.workable_queued_jobs.count
    assert_equal @expected_my_workable_count, ApplicationJob.new.workable_queued_jobs.count
  end

  test 'waiting_to_start_jobs.count returns the number of jobs waiting to start' do
    assert_equal @expected_waiting_to_start_count, ActiveJobMetrics.waiting_to_start_jobs.count
    assert_equal @expected_my_waiting_to_start_count, ApplicationJob.new.waiting_to_start_jobs.count
  end

  test 'running_jobs.count returns the number of jobs currently running' do
    assert_equal @expected_running_count, ActiveJobMetrics.running_jobs.count
    assert_equal @expected_my_running_count, ApplicationJob.new.running_jobs.count
  end

  test 'overall queue metrics include worker count and idle workers percent' do
    ActiveJobMetrics.stubs(:worker_count).returns(4)

    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(WorkerCount: 4, RunningJobCount: @expected_running_count, PercentWorkersIdle: 50.0),
        includes_dimensions(:WorkerCount, Environment: CDO.rack_env),
        includes_dimensions(:RunningJobCount, Environment: CDO.rack_env),
        includes_dimensions(:PercentWorkersIdle, Environment: CDO.rack_env)
      )
    )

    ActiveJobMetrics.report_overall_queue_metrics
  end

  test 'job-specific queue metrics do not include overall-only metrics' do
    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      assert_equal ApplicationJob::METRICS_NAMESPACE, namespace

      running_metric = metrics.find {|m| m[:metric_name] == 'RunningJobCount'}
      worker_metric = metrics.find {|m| m[:metric_name] == 'WorkerCount'}
      idle_workers_percent_metric = metrics.find {|m| m[:metric_name] == 'PercentWorkersIdle'}

      assert_equal @expected_my_running_count, running_metric[:value]
      assert_nil worker_metric
      assert_nil idle_workers_percent_metric
      assert(metrics.none? {|metric| metric[:dimensions].any? {|dimension| dimension[:name] == 'Priority'}})
    end

    ActiveJobMetrics.report_metrics(ApplicationJob.new, dimensions: [{name: 'Environment', value: CDO.rack_env}, {name: 'JobName', value: 'ApplicationJob'}])
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
    ActiveJobMetrics.stubs(:worker_count).returns(4)

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

    ActiveJobMetrics.report_overall_queue_metrics
  end

  test 'pending priority metrics publish zero for an empty band and after the queue drains' do
    dimensions = [{name: 'Environment', value: CDO.rack_env}]
    ActiveJobMetrics.stubs(:worker_count).returns(4)
    published_metrics = []
    Cdo::Metrics.expects(:push).twice.with do |namespace, metrics|
      assert_equal ActiveJobMetrics::METRICS_NAMESPACE, namespace
      published_metrics << metrics.select do |metric|
        metric[:metric_name] == 'PendingJobCount' && metric[:dimensions].any? {|dimension| dimension[:name] == 'Priority'}
      end
      true
    end

    ActiveJobMetrics.report_metrics(ActiveJobMetrics, dimensions: dimensions, report_overall_metrics: true)
    Delayed::Job.delete_all
    ActiveJobMetrics.report_metrics(ActiveJobMetrics, dimensions: dimensions, report_overall_metrics: true)

    assert_equal [4, 0], published_metrics.first.pluck(:value)
    assert_equal [0, 0], published_metrics.last.pluck(:value)
    assert_equal(['high', 'low'], published_metrics.last.map {|metric| metric[:dimensions].last[:value]})
    assert_equal [{name: 'Environment', value: CDO.rack_env}], dimensions
  end

  test 'enqueued jobs log several metrics' do
    # Splitting this into two assertions because 'includes_metrics' can't match multiple metrics with the same name.
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(
          QueuedJobCount: @expected_queued_count,
          WorkableQueuedJobCount: @expected_workable_count,
          FailedJobCount: @expected_failed_count,
          PendingJobCount: @expected_pending_count,
          WaitingToStartJobCount: @expected_waiting_to_start_count,
        ),
        includes_dimensions(:QueuedJobCount, Environment: CDO.rack_env),
        includes_dimensions(:WorkableQueuedJobCount, Environment: CDO.rack_env),
        includes_dimensions(:FailedJobCount, Environment: CDO.rack_env),
        includes_dimensions(:PendingJobCount, Environment: CDO.rack_env),
        includes_dimensions(:WaitingToStartJobCount, Environment: CDO.rack_env),
        includes_dimensions(:RunningJobCount, Environment: CDO.rack_env),
        includes_dimensions(:OldestPendingJobAge, Environment: CDO.rack_env),
        includes_dimensions(:OldestWaitingToStartJobAge, Environment: CDO.rack_env),
      )
    )
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(
          QueuedJobCount: @expected_my_queued_count,
          WorkableQueuedJobCount: @expected_my_workable_count,
          FailedJobCount: @expected_my_failed_count,
          PendingJobCount: @expected_my_pending_count,
          WaitingToStartJobCount: @expected_my_waiting_to_start_count,
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

  # PerformCount: one datum per perform attempt run by an ActiveJob worker
  # process, labelled with its outcome and the platform that ran it.

  def stub_worker_process
    CDO.stubs(:running_active_job_worker?).returns(true)
  end

  # Lets every push through and returns the PerformCount data among them.
  def capture_perform_counts
    perform_counts = []
    Cdo::Metrics.stubs(:push).with do |_namespace, metrics|
      perform_counts.concat(metrics.select {|metric| metric[:metric_name] == 'PerformCount'})
      true
    end
    perform_counts
  end

  def expect_perform_count(job_class, outcome:, platform: 'ec2')
    Cdo::Metrics.stubs(:push)
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(PerformCount: 1),
        includes_dimensions(
          :PerformCount,
          Environment: CDO.rack_env,
          JobName: job_class.name,
          Outcome: outcome,
          Platform: platform
        )
      )
    ).once
  end

  def stub_perform_count_push_to_raise
    Cdo::Metrics.stubs(:push)
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(PerformCount: anything)
    ).raises('PerformCount push failed')
  end

  test 'a job that succeeds in a worker pushes PerformCount with outcome success' do
    stub_worker_process
    expect_perform_count(TestableJob, outcome: 'success')

    TestableJob.perform_now
  end

  test 'PerformCount carries exactly four dimensions, a count of one and no failure datum' do
    stub_worker_process
    perform_counts = capture_perform_counts

    TestableJob.perform_now

    assert_equal 1, perform_counts.length
    datum = perform_counts.first
    assert_equal 1, datum[:value]
    assert_equal 'Count', datum[:unit]
    assert_kind_of Time, datum[:timestamp]
    assert_equal(
      [
        {name: 'Environment', value: CDO.rack_env},
        {name: 'JobName', value: 'ApplicationJobTest::TestableJob'},
        {name: 'Outcome', value: 'success'},
        {name: 'Platform', value: 'ec2'},
      ],
      datum[:dimensions]
    )
  end

  test 'a job that raises in a worker pushes PerformCount with outcome failure and still raises' do
    stub_worker_process
    expect_perform_count(FailingJob, outcome: 'failure')

    exception = assert_raises(RuntimeError) {FailingJob.perform_now}
    assert_equal 'job failed', exception.message
  end

  test 'a job that swallows its failure with rescue_from still pushes outcome failure' do
    stub_worker_process
    expect_perform_count(SwallowingJob, outcome: 'failure')

    SwallowingJob.perform_now
  end

  test 'a retried job pushes one PerformCount per attempt' do
    stub_worker_process
    perform_counts = capture_perform_counts

    perform_enqueued_jobs do
      RetriedJob.perform_later
    end

    outcomes = perform_counts.map {|datum| datum[:dimensions].find {|dimension| dimension[:name] == 'Outcome'}[:value]}
    assert_equal %w(failure success), outcomes
  end

  test 'a job aborted by its own before_perform pushes outcome success without performing' do
    stub_worker_process
    expect_perform_count(AbortedJob, outcome: 'success')

    job = AbortedJob.new
    job.expects(:perform).never
    job.perform_now
  end

  test 'a job skipped by its own around_perform pushes outcome success without performing' do
    stub_worker_process
    expect_perform_count(SkippedJob, outcome: 'success')

    job = SkippedJob.new
    job.expects(:perform).never
    job.perform_now
  end

  test 'PerformCount takes its platform from CDO.compute_platform' do
    stub_worker_process
    CDO.stubs(:compute_platform).returns('k8s')
    expect_perform_count(TestableJob, outcome: 'success', platform: 'k8s')

    TestableJob.perform_now
  end

  test 'a job run outside a worker process pushes no PerformCount and runs normally' do
    perform_counts = capture_perform_counts

    job = TestableJob.new
    job.expects(:perform).once
    job.perform_now

    assert_empty perform_counts
  end

  test 'a failing PerformCount push does not fail a successful job and is reported once' do
    stub_worker_process
    stub_perform_count_push_to_raise

    Honeybadger.expects(:notify).once

    TestableJob.perform_now
  end

  test 'a failing PerformCount push does not replace the exception of a failed job' do
    stub_worker_process
    stub_perform_count_push_to_raise
    Honeybadger.stubs(:notify)

    exception = assert_raises(RuntimeError) {FailingJob.perform_now}
    assert_equal 'job failed', exception.message
  end

  test 'a failing error report in the PerformCount path does not change the result of a job' do
    stub_worker_process
    stub_perform_count_push_to_raise
    Observability::Errors.stubs(:report).raises('error report failed')

    TestableJob.perform_now

    exception = assert_raises(RuntimeError) {FailingJob.perform_now}
    assert_equal 'job failed', exception.message
  end

  test 'common_dimensions is still exactly Environment and JobName' do
    assert_equal(
      [
        {name: 'Environment', value: CDO.rack_env},
        {name: 'JobName', value: 'ApplicationJobTest::TestableJob'},
      ],
      TestableJob.new.send(:common_dimensions)
    )
  end
end
