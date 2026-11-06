require_relative '../test_helper'
require 'cdo/active_job_queue_metrics'

# The SQL runs against MySQL in dashboard/test/jobs/application_job_test.rb.
class ActiveJobQueueMetricsTest < Minitest::Test
  NOW = Time.utc(2026, 11, 6, 12, 0, 0)

  def row(job_class, **overrides)
    counts = {
      queued: 3, pending: 2, pending_high: 2, pending_low: 0, waiting_to_start: 1,
      running: 1, failed: 1, oldest_pending_age: 30, oldest_waiting_to_start_age: 20,
    }
    {'job_class' => job_class}.merge(counts.merge(overrides).transform_keys(&:to_s))
  end

  def query_returning(*rows)
    ->(_sql) {rows}
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

  def test_counts_by_class_accepts_symbol_keys_and_non_integer_values
    symbol_row = row('A::Job').to_h {|key, value| [key.to_sym, key == 'job_class' ? value : value.to_s]}
    counts = Cdo::ActiveJobQueueMetrics.counts_by_class(query_returning(symbol_row), now: NOW)
    assert_equal 3, counts.fetch('A::Job')[:queued]
    assert_equal 30, counts.fetch('A::Job')[:oldest_pending_age]
  end

  def test_total_sums_counts_and_takes_the_oldest_age
    total = Cdo::ActiveJobQueueMetrics.total(
      [
        {queued: 1, oldest_pending_age: 5, oldest_waiting_to_start_age: 0},
        {queued: 2, oldest_pending_age: 40, oldest_waiting_to_start_age: 7},
      ].map {|counts| Cdo::ActiveJobQueueMetrics::COLUMNS.to_h {|column| [column, counts.fetch(column, 0)]}}
    )
    assert_equal 3, total[:queued]
    assert_equal 40, total[:oldest_pending_age]
    assert_equal 7, total[:oldest_waiting_to_start_age]
  end

  def test_sql_compares_against_now_in_utc
    now = Time.new(2026, 11, 6, 4, 0, 0, '-08:00')
    assert_includes Cdo::ActiveJobQueueMetrics.sql(now: now), "run_at <= '2026-11-06 12:00:00'"
  end

  def test_report_publishes_queue_wide_priority_and_per_class_metrics
    metrics = pushed_metrics do
      Cdo::ActiveJobQueueMetrics.report(query_returning(row('A::Job'), row('B::Job', pending_low: 2, oldest_pending_age: 50)), environment: 'test', now: NOW)
    end
    published = values(metrics)

    assert_equal 6, published[['QueuedJobCount', ['test']]]
    assert_equal 4, published[['PendingJobCount', ['test']]]
    assert_equal 4, published[['WorkableQueuedJobCount', ['test']]]
    assert_equal 2, published[['RunningJobCount', ['test']]]
    assert_equal 50, published[['OldestPendingJobAge', ['test']]]
    assert_equal 4, published[['PendingJobCount', ['test', 'high']]]
    assert_equal 2, published[['PendingJobCount', ['test', 'low']]]
    assert_equal 3, published[['QueuedJobCount', ['test', 'A::Job']]]
    assert_equal 50, published[['OldestPendingJobAge', ['test', 'B::Job']]]
    assert_equal 8 + 2 + (8 * 2), metrics.size
  end

  def test_report_counts_rows_without_a_job_class_only_queue_wide
    metrics = pushed_metrics do
      Cdo::ActiveJobQueueMetrics.report(query_returning(row('A::Job'), row(nil)), environment: 'test', now: NOW)
    end
    assert_equal 6, values(metrics)[['QueuedJobCount', ['test']]]
    assert(metrics.none? {|metric| metric[:dimensions].any? {|d| d[:name] == 'JobName' && d[:value].nil?}})
  end

  def test_report_publishes_zeros_for_an_empty_queue
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report(query_returning, environment: 'test', now: NOW)}
    assert_equal 10, metrics.size
    assert(metrics.all? {|metric| metric[:value] == 0})
  end

  def test_report_publishes_worker_metrics_when_given_a_worker_count
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report(query_returning(row('A::Job')), environment: 'test', now: NOW, worker_count: 4)}
    assert_equal 4, values(metrics)[['WorkerCount', ['test']]]
    assert_equal 75.0, values(metrics)[['PercentWorkersIdle', ['test']]]
  end

  def test_report_reports_zero_idle_without_workers
    metrics = pushed_metrics {Cdo::ActiveJobQueueMetrics.report(query_returning, environment: 'test', now: NOW, worker_count: 0)}
    assert_equal 0, values(metrics)[['PercentWorkersIdle', ['test']]]
  end
end
