class ContinuousIntegrationLevelBuilderEnvironment < ContinuousIntegrationEnvironment
  # Log details of a build to metrics database.
  # TODO: (suresh) This method will eventually be used to write build status for all managed environments.
  # @param [Symbol] event_status - :start, :success, :failed
  def write_build_status(event_status)
    event = "#{@environment}_#{event_status}"
    Metrics.write_metric(event, @commit_hash, Metrics::AUTOMATIC)
  end
end
