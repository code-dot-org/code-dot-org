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

  test 'enqueued jobs log PendingJobCount FailedJobCount WaitTime ExecutionTime and TotalTime' do
    expected_failed_count = 5
    expected_pending_count = 3
    expected_workable_count = 2

    # Mock these helper methods because mocking the Delayed::Job calls is impossible/complex
    ApplicationJob.any_instance.stubs(:get_pending_job_count).returns(expected_pending_count)
    ApplicationJob.any_instance.stubs(:get_failed_job_count).returns(expected_failed_count)
    ApplicationJob.any_instance.stubs(:get_workable_job_count).returns(expected_workable_count)

    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(PendingJobCount: expected_pending_count, FailedJobCount: expected_failed_count, WorkableJobCount: expected_workable_count),
        includes_dimensions(:PendingJobCount, Environment: CDO.rack_env),
        includes_dimensions(:FailedJobCount, Environment: CDO.rack_env),
        includes_dimensions(:WorkableJobCount, Environment: CDO.rack_env)
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

  test 'after_enqueue notifies and continues upon error' do
    Cdo::Metrics.stubs(:push)
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      includes_metrics(PendingJobCount: anything)
    ).raises('An error that should be squashed')

    Harness.expects(:error_notify).once

    begin
      TestableJob.perform_later
    rescue => exception
      raise exception, 'Expected error to be squashed'
    end
  end

  test 'before_perform notifies and continues upon error' do
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

    Harness.expects(:error_notify).once

    perform_enqueued_jobs do
      TestableJob.perform_later
    rescue => exception
      raise exception, 'Expected error to be squashed'
    end
  end

  test 'after_perform notifies and continues upon error' do
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

    Harness.expects(:error_notify).once

    perform_enqueued_jobs do
      TestableJob.perform_later
    rescue => exception
      raise exception, 'Expected error to be squashed'
    end
  end

  test 'get_pending_job_count returns the number of pending jobs' do
    Delayed::Job.expects(:where).with(failed_at: nil).returns(stub(count: 42))
    assert_equal 42, ApplicationJob.new.get_pending_job_count
  end

  test 'get_failed_job_count returns the number of failed jobs' do
    failed_jobs_mock = mock('failed_jobs')
    where_mock = mock('where')

    Delayed::Job.expects(:where).returns(where_mock)
    where_mock.expects(:not).with(failed_at: nil).returns(failed_jobs_mock)
    failed_jobs_mock.expects(:count).returns(42)

    assert_equal 42, ApplicationJob.new.get_failed_job_count
  end

  test 'get_workable_job_count returns the number of workable jobs' do
    workable_mock = mock('workable_jobs')
    pending_mock = mock('pending_jobs')
    Delayed::Job.expects(:where).with(failed_at: nil, locked_at: nil).returns(pending_mock)
    pending_mock.expects(:where).with('run_at <= ?', anything).returns(workable_mock)
    workable_mock.expects(:count).returns(42)

    assert_equal 42, ApplicationJob.new.get_workable_job_count
  end
end
