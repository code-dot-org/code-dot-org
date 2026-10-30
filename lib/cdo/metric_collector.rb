# frozen_string_literal: true

require 'cdo/aws/metrics'
require 'honeybadger/ruby'
require 'concurrent/timer_task'
require 'observability/errors'

module Cdo
  class MetricCollector
    def initialize(namespace:, dimensions:, interval:, resolution:)
      @namespace = namespace
      @dimensions = dimensions
      @interval = interval
      @resolution = resolution
    end

    def start
      return @task if @task&.running?
      @task = Concurrent::TimerTask.new(execution_interval: @interval) {collect}.
        with_observer {|_, _, ex| Observability::Errors.report(ex) if ex}.
        execute
    end

    def shutdown
      @task&.shutdown
    end

    def snapshot
      raise NotImplementedError
    end

    private def collect
      publish(snapshot)
    end

    private def publish(metrics)
      metrics.each do |name, value|
        Cdo::Metrics.put(
          @namespace,
          name,
          value,
          @dimensions,
          storage_resolution: @resolution
        )
      end
    end
  end
end
