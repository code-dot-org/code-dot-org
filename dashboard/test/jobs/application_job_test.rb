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

  test 'jobs log JobCount when enqueued' do
    # When testing, jobs aren't queued to the DB, so mock that.
    Delayed::Job.stubs(:count).returns(1)

    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(JobCount: 1),
        includes_dimensions(:JobCount, Environment: CDO.rack_env)
      )
    )

    TestableJob.perform_later
  end

  test 'enqueued jobs log JobCount, WaitTime, ExecutionTime, and TotalTime' do
    # after_enqueue metrics
    Delayed::Job.stubs(:count).returns(1)
    Cdo::Metrics.expects(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      all_of(
        includes_metrics(JobCount: 1),
        includes_dimensions(:JobCount, Environment: CDO.rack_env)
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
      includes_metrics(JobCount: anything)
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
      includes_metrics(JobCount: anything)
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
      includes_metrics(JobCount: anything)
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
