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
    job_rows = [
      {handler: "Failed Job, #{job_class}", run_at: t, created_at: t, updated_at: t, failed_at: t, last_error: 'Failed job error', locked_at: nil, locked_by: nil},
      {handler: "Running job, #{job_class}", run_at: t, created_at: t, updated_at: t, locked_at: t, locked_by: 'delayed_job.1', failed_at: nil, last_error: nil},
      {handler: "Waiting to start job, #{job_class}", run_at: t, created_at: t, updated_at: t, failed_at: nil, last_error: nil, locked_at: nil, locked_by: nil},
      {handler: "Distant future scheduled job, #{job_class}", run_at: t + 1.month, created_at: t, updated_at: t, failed_at: nil, last_error: nil, locked_at: nil, locked_by: nil},
    ]
    Delayed::Job.insert_all(job_rows)
  end

  setup do
    Delayed::Job.delete_all

    @t = Time.now.utc + 1.day
    populate_jobs_table(@t, 'ApplicationJobTest::TestableJob')
    populate_jobs_table(@t, 'Some::OtherJob')

    @t_offset = 10.seconds

    # Time starts 10 seconds after creating our test jobs
    ActiveJobMetrics.stubs(:_now_utc).returns(@t + @t_offset)

    @expected_my_failed_count = 1
    @expected_my_waiting_to_start_count = 1
    @expected_my_pending_count = 2
    @expected_my_queued_count = 3

    @expected_failed_count = @expected_my_failed_count * 2
    @expected_waiting_to_start_count = @expected_my_waiting_to_start_count * 2
    @expected_pending_count = @expected_my_pending_count * 2
    @expected_queued_count = @expected_my_queued_count * 2
  end

  test 'includes ActiveJobMetrics' do
    assert_includes ApplicationJob.ancestors, ActiveJobMetrics
  end

  test 'includes ActiveJobReporting' do
    assert_includes ApplicationJob.ancestors, ActiveJobReporting
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

  test 'waiting_to_start_jobs.count returns the number of jobs waiting to start' do
    assert_equal @expected_waiting_to_start_count, ActiveJobMetrics.waiting_to_start_jobs.count
    assert_equal @expected_my_waiting_to_start_count, ApplicationJob.new.waiting_to_start_jobs.count
  end

  test 'enqueued jobs log several metrics' do
    # Splitting this into two assertions because 'includes_metrics' can't match multiple metrics with the same name.
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(
          QueuedJobCount: @expected_queued_count,
          FailedJobCount: @expected_failed_count,
          PendingJobCount: @expected_pending_count,
          WaitingToStartJobCount: @expected_waiting_to_start_count,
        ),
        includes_dimensions(:QueuedJobCount, Environment: CDO.rack_env),
        includes_dimensions(:FailedJobCount, Environment: CDO.rack_env),
        includes_dimensions(:PendingJobCount, Environment: CDO.rack_env),
        includes_dimensions(:WaitingToStartJobCount, Environment: CDO.rack_env),
        includes_dimensions(:OldestPendingJobAge, Environment: CDO.rack_env),
        includes_dimensions(:OldestWaitingToStartJobAge, Environment: CDO.rack_env),
      )
    )
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(
          QueuedJobCount: @expected_my_queued_count,
          FailedJobCount: @expected_my_failed_count,
          PendingJobCount: @expected_my_pending_count,
          WaitingToStartJobCount: @expected_my_waiting_to_start_count,
        ),
        includes_dimensions(:QueuedJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:FailedJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:PendingJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
        includes_dimensions(:WaitingToStartJobCount, Environment: CDO.rack_env, JobName: 'ApplicationJobTest::TestableJob'),
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
