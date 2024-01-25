require 'cdo/metrics_helper'

class CiBuildMetrics
  # Log details of a build to metrics database.
  # @param [Symbol] environment
  # @param [String] commit_hash
  # @param [Symbol] status - :start, :success, :failed
  def self.write_build_status(environment, commit_hash, status)
    if environment == :staging
      event = "#{environment}_#{status}"
      Metrics.write_metric(event, commit_hash, Metrics::AUTOMATIC)
    end
  end
end
