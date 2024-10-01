class AichatMetrics
  # The CloudWatch metric namespace
  METRICS_NAMESPACE = 'GenAICurriculum'.freeze

  def self.report_aichat_job(metric_name:, model_id:, execution_status: nil, value: 1)
    job_dimensions = [
      {name: 'Environment', value: CDO.rack_env},
      {name: 'ModelId', value: model_id},
    ]
    if execution_status
      job_dimensions << {name: 'ExecutionStatus', value: execution_status}
    end
    Cdo::Metrics.push(
      METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: value,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: job_dimensions
        }
      ]
    )
  end

  def self.report_aichat_job_execution(metric_name:, model_id:, execution_time:)
    Cdo::Metrics.push(
      METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: execution_time,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'ModelId', value: model_id},
          ],
        }
      ]
    )
  end

  def self.report_openai_safety_check(metric_name:, safety_system_prompt:, num_attempts: nil, value: 1)
    openai_dimensions = [
      {name: 'Environment', value: CDO.rack_env},
      {name: 'SafetySystemPrompt', value: safety_system_prompt},
    ]
    if num_attempts
      openai_dimensions << {name: 'Attempts', value: num_attempts}
    end

    Cdo::Metrics.push(METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: value,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: openai_dimensions
        }
      ]
    )
  end

  def self.report_openai_safety_latency(metric_name:, safety_system_prompt:, latency:)
    Cdo::Metrics.push(METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: latency,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'SafetySystemPrompt', value: safety_system_prompt}
          ],
        }
      ]
    )
  end
end
