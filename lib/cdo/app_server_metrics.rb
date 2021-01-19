require 'raindrops'
require 'cdo/aws/metrics'
require 'honeybadger/ruby'
require 'concurrent/timer_task'
require 'active_support/core_ext/module/attribute_accessors'

module Cdo
  # AppServerMetrics extends the Raindrops::Middleware class,
  # which instruments a Rack application to collect the number of
  # currently-executing requests using an atomic counter shared across
  # all forked worker-processes.
  #
  # Every :interval seconds (default 1), metrics are collected.
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
  class AppServerMetrics < Raindrops::Middleware
    cattr_accessor :instance

    def initialize(app, opts = {})
      # Track max_calling using a modified Stats implementation.
      opts[:stats] ||= StatsWithMax.new
      # Disable the reporting endpoint with an empty-string :path by default.
      opts[:path] ||= ''
      super(app, opts)
      @metrics = %i(active queued calling).map {|name| [name, []]}.to_h

      @namespace = opts[:namespace] || 'App Server'
      @dimensions = opts[:dimensions] || {}
      @interval = opts[:interval] || 1
      self.instance = self
    end

    def shutdown
      @task && @task.shutdown
    end

    def spawn_reporting_task
      @task ||= Concurrent::TimerTask.new(execution_interval: @interval, &method(:collect_metrics)).
        with_observer {|_, _, ex| Honeybadger.notify(ex) if ex}.
        execute
    end

    # Periodically collect unicorn-listener metrics.
    def collect_metrics(*_)
      collect_listener_stats.each do |name, value|
        Cdo::Metrics.put(
          "#{@namespace}/#{name}",
          value,
          @dimensions,
          storage_resolution: 1,
          unit: 'Count'
        )
      end
    end

    # Collect current snapshot of tcp/unix listener stats.
    # @return [Hash{Symbol => Number}]
    def collect_listener_stats
      stats = {}
      stats.merge! Raindrops::Linux.tcp_listener_stats(@tcp.uniq) if @tcp
      stats.merge! Raindrops::Linux.unix_listener_stats(@unix.uniq) if @unix
      stats = %i(active queued).map do |name|
        [name, stats.values.map(&name).inject(:+)]
      end.to_h
      stats[:calling] = @stats.max_calling.tap {@stats.max_calling = 0}
      stats
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
