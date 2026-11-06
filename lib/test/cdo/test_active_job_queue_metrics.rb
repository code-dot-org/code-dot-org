require_relative '../test_helper'
require 'cdo/active_job_queue_metrics'

# The SQL runs against MySQL in dashboard/test/jobs/application_job_test.rb.
class ActiveJobQueueMetricsTest < Minitest::Test
  NOW = Time.utc(2026, 11, 6, 12, 0, 0)

  COUNTS = {
    queued: 6,
    pending: 4,
    pending_high: 3,
    pending_low: 1,
    waiting_to_start: 2,
    running: 2,
    failed: 1,
    oldest_pending_age: 30,
    oldest_waiting_to_start_age: 20,
  }.freeze

  # Sequel returns symbol keys; ActiveRecord returns string keys.
  def select_one(row = COUNTS)
    ->(_sql) {row}
  end

  def pushed_metrics
    pushed = nil
    Cdo::Metrics.stubs(:push).with {|_namespace, metrics| pushed = metrics}
    yield
    pushed
  end

  def values(metrics)
    metrics.to_h {|metric| [[metric[:metric_name], metric[:dimensions].map {|d| d[:value]}], metric[:value]]}
  end

  def test_counts_accepts_string_keys_and_non_integer_values
    row = COUNTS.to_h {|key, value| [key.to_s, value.to_s]}
    assert_equal COUNTS, Cdo::ActiveJobQueueMetrics.counts(select_one(row), now: NOW)
  end

  def test_sql_filters_by_job_class_only_when_given
    refute_includes Cdo::ActiveJobQueueMetrics.sql(now: NOW), 'WHERE'
    assert_includes Cdo::ActiveJobQueueMetrics.sql(now: NOW, job_class: 'Foo::BarJob'), "WHERE handler LIKE '%job_class: Foo::BarJob%'"
  end

  def test_sql_compares_against_now_in_utc
    now = Time.new(2026, 11, 6, 4, 0, 0, '-08:00')
    assert_includes Cdo::ActiveJobQueueMetrics.sql(now: now), "run_at <= '2026-11-06 12:00:00'"
  end

  def test_sql_rejects_a_job_class_that_is_not_a_constant_name
    ["Foo'; DROP TABLE delayed_jobs; --", 'foo', 'Foo%', ''].each do |job_class|
      assert_raises(ArgumentError) {Cdo::ActiveJobQueueMetrics.sql(now: NOW, job_class: job_class)}
    end
  end

  def test_report_overall_publishes_queue_and_priority_metrics
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report_overall(select_one, environment: 'test', now: NOW)}
    assert_equal(
      {
        ['QueuedJobCount', ['test']] => 6,
        ['WorkableQueuedJobCount', ['test']] => 4,
        ['PendingJobCount', ['test']] => 4,
        ['FailedJobCount', ['test']] => 1,
        ['WaitingToStartJobCount', ['test']] => 2,
        ['RunningJobCount', ['test']] => 2,
        ['OldestPendingJobAge', ['test']] => 30,
        ['OldestWaitingToStartJobAge', ['test']] => 20,
        ['PendingJobCount', ['test', 'high']] => 3,
        ['PendingJobCount', ['test', 'low']] => 1,
      },
      values(metrics)
    )
  end

  def test_report_overall_publishes_worker_metrics_when_given_a_worker_count
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report_overall(select_one, environment: 'test', now: NOW, worker_count: 8)}
    assert_equal 8, values(metrics)[['WorkerCount', ['test']]]
    assert_equal 75.0, values(metrics)[['PercentWorkersIdle', ['test']]]
  end

  def test_report_overall_reports_zero_idle_without_workers
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report_overall(select_one, environment: 'test', now: NOW, worker_count: 0)}
    assert_equal 0, values(metrics)[['PercentWorkersIdle', ['test']]]
  end

  def test_report_job_publishes_queue_metrics_with_the_job_name
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report_job(select_one, job_class: 'Foo::BarJob', environment: 'test', now: NOW)}
    assert_equal 8, metrics.size
    assert(metrics.all? {|metric| metric[:dimensions] == [{name: 'Environment', value: 'test'}, {name: 'JobName', value: 'Foo::BarJob'}]})
    names = metrics.map {|metric| metric[:metric_name]}
    assert_empty names & %w[WorkerCount PercentWorkersIdle]
  end
end
