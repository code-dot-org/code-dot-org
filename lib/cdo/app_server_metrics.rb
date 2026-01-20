require 'raindrops'
require 'cdo/aws/metrics'
require 'honeybadger/ruby'
require 'concurrent/timer_task'
require 'active_support/core_ext/module/attribute_accessors'
require 'thread'

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
      @instance_id = 'UNKNOWN'
      @id_mutex = Mutex.new # Protects the promotion logic
      self.instance = self
    end

    # Thread-safe helper to fetch or retry the ID
    def instance_id
      # Fast path: return the ID if it's already known
      unless @instance_id == 'UNKNOWN'
        return @instance_id
      end

      # Slow path: synchronize to fetch the ID
      @id_mutex.synchronize do
        # Double-check inside the lock to prevent redundant network calls
        if @instance_id == 'UNKNOWN'
          fetched_id = AWS::EC2.instance_id
          @instance_id = fetched_id if fetched_id # Update only on success
        end
      end

      @instance_id
    end

    def shutdown
      @spawn_reporting_task&.shutdown
    end

    def spawn_reporting_task
      @spawn_reporting_task ||= Concurrent::TimerTask.new(execution_interval: @interval) {|task| collect_metrics(task)}.
        with_observer {|_, _, ex| Honeybadger.notify(ex) if ex}.
        execute
    end

    # Periodically collect unicorn-listener metrics.
    def collect_metrics(*_)
      # Retrieve the best available ID (UNKNOWN or real i-xxxx)
      current_instance_id = instance_id

      collect_listener_stats.each do |name, value|
        Cdo::Metrics.put(
          @namespace,
          name,
          value,
          @dimensions,
          storage_resolution: 1,
          unit: 'Count'
        )
        # Also publish active/queued/calling listener metrics with an EC2 Instance ID Dimension.
        Cdo::Metrics.put(
          @namespace,
          name,
          value,
          @dimensions.merge(InstanceId: current_instance_id),
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
        [name, stats.values.sum(&name)]
      end.to_h
      stats[:calling] = @stats.max_calling.tap {@stats.max_calling = 0}
      stats
    end

    # Gathers cloudfront metrics from each puma worker process and logs it
    # to CloudWatch segmented by Host and PID. To get overall values, you
    # must aggregate/sum across all Host and PID dimensions in CloudWatch.
    def self.start_background_metrics_thread(host:)
      Thread.new do
        # Set a helpful name for debugging in thread dumps
        Thread.current.name = "cdo-actioncable-metrics"

        # Base dimensions that don't change
        base_dimensions = {
          PID: Process.pid.to_s,
          Host: host,
        }

        loop do
          begin
            # Use the Rails executor to safely interact with ActionCable and DB connections
            Rails.application.executor.wrap do
              # Access the latest ID via the thread-safe singleton accessor
              # Retry the metadata lookup if it is currently 'UNKNOWN'
              current_id = Cdo::AppServerMetrics.instance&.instance_id || 'UNKNOWN'

              dimensions = base_dimensions.merge(InstanceId: current_id)

              if defined?(ActionCable) && ActionCable.server
                Cdo::Metrics.put(
                  'ActionCable',
                  'ServerConnectionsCount',
                  ActionCable.server.connections.count,
                  dimensions,
                  unit: 'Count'
                )
              end
            end
          rescue StandardError=> exception
            # Prevent the thread from dying silently on a network or ActionCable error
            Honeybadger.notify(exception, context: {component: 'actioncable_metrics_thread'})
          end

          sleep 30.seconds
        end
      end
    end
  end

  # Extends Raindrops::Middleware::Stats (which defines :calling and :writing)
  # with an additional :max_calling atomic counter.
  # This allows us to record the peak number of currently-executing
  # worker-processes at any point, which a one-second sampling interval
  # might not otherwise capture.
  class StatsWithMax < Raindrops::Struct.new(:calling, :writing, :max_calling)
    # Override incr_calling to keep max_calling updated.
    def incr_calling
      calling = super
      self.max_calling = calling if calling > max_calling
    end
  end
end
