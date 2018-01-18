require 'raindrops'
require 'cdo/aws/metrics'
require 'honeybadger'
require 'concurrent/timer_task'

module Cdo
  # UnicornListener extends the Raindrops::Middleware class,
  # which instruments a Rack application to collect the number of
  # currently-executing requests using an atomic counter shared across
  # all Unicorn worker-processes.
  #
  # Every :interval seconds (default 1), metrics are collected.
  # Once :report_count metrics (default 60) have been collected, they are asynchronously reported to CloudWatch.
  #
  # The following metrics are collected and reported:
  # `active` - the number of active TCP/socket connections
  # `queued` - the number of queued TCP/socket requests
  # `calling` - the maximum number of currently-executing requests at any point during the interval.
  #
  # The :listeners option accepts an array of strings (TCP or Unix domain socket names).
  # By default, all listeners used by the Unicorn master process are monitored.
  #
  # Any errors are forwarded to Honeybadger for logging and notifying.
  class UnicornListener < Raindrops::Middleware
    def initialize(app, opts = {})
      # Track max_calling using a modified Stats implementation.
      opts[:stats] ||= StatsWithMax.new
      # Disable the reporting endpoint with an empty-string :path by default.
      opts[:path] ||= ''
      super(app, opts)
      @metrics = %i(active queued calling).map {|name| [name, []]}.to_h

      @report_count = opts[:report_count] || 60
      interval = opts[:interval] || 1
      spawn_reporting_task(interval) unless interval.zero?
    end

    def shutdown
      @task && @task.shutdown
    end

    def spawn_reporting_task(interval)
      @task ||= Concurrent::TimerTask.new(execution_interval: interval, &method(:collect_metrics)).
        with_observer {|_, _, ex| Honeybadger.notify(ex) if ex}.
        execute
    end

    # Periodically collect unicorn-listener metrics,
    # reporting every time `report_count` metrics have been collected.
    def collect_metrics(*_)
      stat_values = collect_listener_stats + [@stats.max_calling.tap {@stats.max_calling = 0}]
      @metrics.zip(stat_values) {|stat, val| stat[1] << {timestamp: Time.now, value: val}}
      report!(@metrics) if @metrics.values.first.count >= @report_count
    end

    # Collect current snapshot of tcp/unix listener stats.
    def collect_listener_stats
      stats = {}
      stats.merge! Raindrops::Linux.tcp_listener_stats(@tcp.uniq) if @tcp
      stats.merge! Raindrops::Linux.unix_listener_stats(@unix.uniq) if @unix
      %i(active queued).map do |name|
        stats.values.map(&name).inject(:+)
      end
    end

    # Report all stats as CloudWatch metrics, then clear the collection.
    # @param metrics [Hash]
    def report!(metrics)
      metric_data = metrics.map do |name, stat|
        stat.reject {|datum| datum[:value].nil?}.map do |datum|
          {
            metric_name: name,
            dimensions: [
              {name: "Environment", value: CDO.rack_env},
              {name: "Host", value: CDO.pegasus_hostname}
            ],
            timestamp: datum[:timestamp],
            value: datum[:value],
            unit: 'Count',
            storage_resolution: 1
          }
        end
      end.flatten
      metrics.values.map(&:clear)
      Cdo::Metrics.push('Unicorn', metric_data)
    end
  end

  # Extends Raindrops::Middleware::Stats (which defines :calling and :writing)
  # with an additional :max_calling atomic counter.
  # This allows us to record the peak number of currently-executing
  # worker-processes at any point, which a one-second sampling interval
  # might not otherwise capture.
  #
  # rubocop:disable Style/StructInheritance
  class StatsWithMax < Raindrops::Struct.new(:calling, :writing, :max_calling)
    # Override incr_calling to keep max_calling updated.
    def incr_calling
      calling = super
      self.max_calling = calling if calling > max_calling
    end
  end
  # rubocop:enable Style/StructInheritance
end
