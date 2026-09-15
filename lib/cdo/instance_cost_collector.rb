# frozen_string_literal: true

require 'cdo/metric_collector'

module Cdo
  # Publishes the modeled compute cost of this EC2 instance as a per-minute rate.
  #
  # Cost is a per-INSTANCE quantity, so this collector runs once per host (from
  # after_booted), not once per puma worker — emitting from every worker would
  # multiply-count the instance's cost.
  #
  # The emitted value is on-demand list price / 60 (see Cdo::InstancePricing for
  # the modeled-vs-billed caveat). InstanceType is carried as a dimension so the
  # rate auto-tracks instance-type experiments and so cost can be grouped by type.
  # Fleet cost-per-minute is SUM(ModeledComputeCostPerMinute) across hosts; divide
  # by the request rate (CloudWatch metric math) for cost-per-request.
  class InstanceCostCollector < MetricCollector
    METRIC_NAME = 'ModeledComputeCostPerMinute'

    # @param cost_per_minute [Float] modeled USD/minute for this instance.
    def initialize(cost_per_minute:, **kwargs)
      super(**kwargs)
      @cost_per_minute = cost_per_minute
    end

    def snapshot
      return {} if @cost_per_minute.nil?

      {METRIC_NAME => @cost_per_minute}
    end

    # CloudWatch has no currency unit; 'None' is the correct unit for a dollar
    # rate (as opposed to the 'Count' units puma stats use).
    private def publish(metrics)
      metrics.each do |name, value|
        Cdo::Metrics.put(
          @namespace, name, value, @dimensions,
          storage_resolution: @resolution, unit: 'None'
        )
      end
    end
  end
end
