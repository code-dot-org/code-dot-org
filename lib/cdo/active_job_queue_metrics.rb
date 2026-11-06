require 'cdo/aws/metrics'

module Cdo
  # Queue metrics for the delayed_jobs table, published to CloudWatch. Shared by
  # the ActiveJobMetrics callbacks in Rails and by
  # bin/cron/report_activejob_metrics, which runs without Rails. Callers pass
  # select_one, a callable that runs one SQL string and returns its row as a
  # Hash, so each side uses its own database connection.
  module ActiveJobQueueMetrics
    NAMESPACE = 'code-dot-org/ActiveJob'.freeze

    # delayed_job runs lower priorities first.
    LOW_PRIORITY_MIN = 10

    # Constrains job class names interpolated into SQL.
    JOB_CLASS_NAME = /\A[A-Z]\w*(::[A-Z]\w*)*\z/

    # Queue-wide metrics. With worker_count, also publishes WorkerCount and
    # PercentWorkersIdle; only the caller that can see the workers passes it.
    def self.report_overall(select_one, environment:, now: Time.now.utc, worker_count: nil)
      counts = counts(select_one, now: now)
      dimensions = [{name: 'Environment', value: environment}]
      metrics = queue_metrics(counts, dimensions)
      metrics += priority_metrics(counts, dimensions)
      metrics += worker_metrics(counts, worker_count, dimensions) if worker_count
      Cdo::Metrics.push(NAMESPACE, metrics)
    end

    def self.report_job(select_one, job_class:, environment:, now: Time.now.utc)
      counts = counts(select_one, now: now, job_class: job_class)
      dimensions = [{name: 'Environment', value: environment}, {name: 'JobName', value: job_class}]
      Cdo::Metrics.push(NAMESPACE, queue_metrics(counts, dimensions))
    end

    def self.counts(select_one, now:, job_class: nil)
      select_one.call(sql(now: now, job_class: job_class)).to_h {|key, value| [key.to_sym, value.to_i]}
    end

    # Pending: eligible to run now, whether or not a worker holds it.
    # Waiting to start: pending and not locked by a worker.
    # Running counts every locked row, including ones whose worker died.
    def self.sql(now:, job_class: nil)
      now = quote_time(now)
      pending = "failed_at IS NULL AND run_at <= #{now}"
      waiting = "#{pending} AND locked_at IS NULL"
      <<~SQL
        SELECT
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
        #{job_class_filter(job_class)}
      SQL
    end

    private_class_method def self.job_class_filter(job_class)
      return '' if job_class.nil?
      raise ArgumentError, "invalid job class name: #{job_class.inspect}" unless JOB_CLASS_NAME.match?(job_class)
      "WHERE handler LIKE '%job_class: #{job_class}%'"
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
