require 'cdo/aws/metrics'

module Cdo
  # Queue metrics for the delayed_jobs table, published to CloudWatch by
  # bin/cron/report_activejob_metrics, which runs without Rails. Callers pass
  # select_all, a callable that runs one SQL string and returns its rows as
  # Hashes, so the SQL is independent of the database library.
  module ActiveJobQueueMetrics
    NAMESPACE = 'code-dot-org/ActiveJob'.freeze

    # delayed_job runs lower priorities first.
    LOW_PRIORITY_MIN = 10

    COLUMNS = %i[
      queued pending pending_high pending_low waiting_to_start running failed
      oldest_pending_age oldest_waiting_to_start_age
    ].freeze
    AGE_COLUMNS = %i[oldest_pending_age oldest_waiting_to_start_age].freeze

    # Publishes queue-wide metrics, which KEDA and alarms read, and the same
    # queue metrics per job class. A class with no rows publishes nothing.
    # With worker_count, also publishes WorkerCount and PercentWorkersIdle.
    def self.report(select_all, environment:, now: Time.now.utc, worker_count: nil)
      by_class = counts_by_class(select_all, now: now)
      overall = total(by_class.values)
      dimensions = [{name: 'Environment', value: environment}]

      metrics = queue_metrics(overall, dimensions) + priority_metrics(overall, dimensions)
      metrics += worker_metrics(overall, worker_count, dimensions) if worker_count
      by_class.each do |job_class, counts|
        next if job_class.nil?
        metrics += queue_metrics(counts, dimensions + [{name: 'JobName', value: job_class}])
      end
      Cdo::Metrics.push(NAMESPACE, metrics)
    end

    # Keyed by job class; nil collects rows whose handler names no ActiveJob
    # class, such as jobs enqueued through delayed_job directly.
    def self.counts_by_class(select_all, now:)
      select_all.call(sql(now: now)).to_h do |row|
        row = row.transform_keys(&:to_sym)
        [row[:job_class], COLUMNS.to_h {|column| [column, row[column].to_i]}]
      end
    end

    def self.total(class_counts)
      COLUMNS.to_h do |column|
        values = class_counts.map {|counts| counts[column]}
        [column, AGE_COLUMNS.include?(column) ? values.max.to_i : values.sum]
      end
    end

    # Pending: eligible to run now, whether or not a worker holds it.
    # Waiting to start: pending and not locked by a worker.
    # Running counts every locked row, including ones whose worker died.
    # The ActiveJob wrapper serializes the class as a 'job_class: Name' line
    # ahead of the job's arguments; 12 skips the 'job_class: ' prefix.
    def self.sql(now:)
      now = quote_time(now)
      pending = "failed_at IS NULL AND run_at <= #{now}"
      waiting = "#{pending} AND locked_at IS NULL"
      <<~SQL
        SELECT
          SUBSTRING(REGEXP_SUBSTR(handler, 'job_class: [A-Za-z0-9_:]+'), 12) AS job_class,
          COUNT(CASE WHEN failed_at IS NULL THEN 1 END) AS queued,
          COUNT(CASE WHEN #{pending} THEN 1 END) AS pending,
          COUNT(CASE WHEN #{pending} AND priority < #{LOW_PRIORITY_MIN} THEN 1 END) AS pending_high,
          COUNT(CASE WHEN #{pending} AND priority >= #{LOW_PRIORITY_MIN} THEN 1 END) AS pending_low,
          COUNT(CASE WHEN #{waiting} THEN 1 END) AS waiting_to_start,
          COUNT(CASE WHEN locked_at IS NOT NULL THEN 1 END) AS running,
          COUNT(CASE WHEN failed_at IS NOT NULL THEN 1 END) AS failed,
          COALESCE(TIMESTAMPDIFF(SECOND, MIN(CASE WHEN #{pending} THEN run_at END), #{now}), 0) AS oldest_pending_age,
          COALESCE(TIMESTAMPDIFF(SECOND, MIN(CASE WHEN #{waiting} THEN run_at END), #{now}), 0) AS oldest_waiting_to_start_age
        FROM delayed_jobs
        GROUP BY job_class
      SQL
    end

    private_class_method def self.quote_time(time)
      "'#{time.utc.strftime('%Y-%m-%d %H:%M:%S')}'"
    end

    # WorkableQueuedJobCount and PendingJobCount have always had one
    # definition; both names stay because dashboards and alarms read either.
    private_class_method def self.queue_metrics(counts, dimensions)
      [
        metric('QueuedJobCount', counts[:queued], 'Count', dimensions),
        metric('WorkableQueuedJobCount', counts[:pending], 'Count', dimensions),
        metric('PendingJobCount', counts[:pending], 'Count', dimensions),
        metric('FailedJobCount', counts[:failed], 'Count', dimensions),
        metric('WaitingToStartJobCount', counts[:waiting_to_start], 'Count', dimensions),
        metric('RunningJobCount', counts[:running], 'Count', dimensions),
        metric('OldestPendingJobAge', counts[:oldest_pending_age], 'Seconds', dimensions),
        metric('OldestWaitingToStartJobAge', counts[:oldest_waiting_to_start_age], 'Seconds', dimensions),
      ]
    end

    # KEDA scales the worker fleet on these when it serves one priority band.
    private_class_method def self.priority_metrics(counts, dimensions)
      {'high' => counts[:pending_high], 'low' => counts[:pending_low]}.map do |band, count|
        metric('PendingJobCount', count, 'Count', dimensions + [{name: 'Priority', value: band}])
      end
    end

    private_class_method def self.worker_metrics(counts, worker_count, dimensions)
      idle = worker_count > 0 ? (worker_count - counts[:running]) / worker_count.to_f * 100 : 0
      [
        metric('WorkerCount', worker_count, 'Count', dimensions),
        metric('PercentWorkersIdle', idle, 'Percent', dimensions),
      ]
    end

    private_class_method def self.metric(name, value, unit, dimensions)
      {metric_name: name, value: value, unit: unit, timestamp: Time.now, dimensions: dimensions}
    end
  end
end
