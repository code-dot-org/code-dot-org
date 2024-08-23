# Singleton class that keeps track of metrics owned by the infrastructure team
# This class is design to keep all the logging centralized regardless of their destination (cloudwatch, honeybadger, etc)
# The class can also hold common dimensions and logging information relevant to the infrastructure team
module Infrastructure
  module Logger
    CLOUD_WATCH_NAMESPACE = 'Infrastructure'.freeze
    @enabled = true
    @dimensions = {environment: rack_env,
                   is_continuous_integration_run: ENV['CI'] ? 'true' : 'false'}
    # Method use to:
    # Add the common namespace
    # Append dimensions in common across metrics
    # Disable operations if needed.
    # The method doesn't flush the metrics. See flush! method
    # @param [String] Name of the metric without namespace
    # @param [Number] value with a default value of 1
    # @param [Hash{Symbol => String}] dimensions
    def self.put(metric_name, metric_value = 1, extra_dimensions = nil)
      unless @enabled
        return
      end
      metric_value = 1 if metric_value.nil?
      dimensions = extra_dimensions.nil? ? extra_dimensions : extra_dimensions.merge(@dimensions)
      Cdo::Metrics.put(CLOUD_WATCH_NAMESPACE, metric_name, metric_value, dimensions)
    end

    def self.flush
      unless @enabled
        return
      end
      begin
        flush!
      rescue => exception
        Harness.error_notify(
          exception,
          error_message: "Failed to log rake task information in cloudwatch",
          )
      end
    end

    # Method to flush all the metrics stored in the buffer.
    def self.flush!
      Cdo::Metrics.flush!
    end
  end
end
