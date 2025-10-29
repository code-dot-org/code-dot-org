require 'cdo/aws/metrics'

class AiLessonSummariesJob < ApplicationJob
  queue_as :default

  before_enqueue do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED])
  end

  before_perform do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:RUNNING])
    report_job_start(request)
  end

  after_perform do |job|
    request = job.arguments.first[:request]
    report_job_finish(request)
  end

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
    if rack_env?(:development)
      puts "AiLessonSummariesJob Error: #{exception.full_message}"
    end

    request = arguments.first[:request]
    request.update!(response: exception.message, execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE])
    Honeybadger.notify(
      "AiLessonSummariesJob failed with unexpected error: #{exception.message}",
      context: {
        request: request.to_json
      }
    )

    # Report metrics for the failed job (after_perform doesn't run on failure).
    report_job_finish(request)

    # Re-raise error to notify our system of the failed job.
    raise exception
  end

  def perform(request:, locale:)
    status, response = get_execution_status_and_response(request, locale)
    request.update!(response: response, execution_status: status)
  end

  private def get_execution_status_and_response(request, locale)
    begin
      response = AiLessonSummariesHelper.get_ai_lesson_summary(request[:lesson_id])
    rescue OpenaiUserInputResponseTimeout => exception
      return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_TIMEOUT], exception.message]
    end

    [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], response]
  end

  private def get_model_id(request)
    request.model_customizations['selectedModelId']
  end

  private def report_job_start(request)
    @start_time = Time.now

    Cdo::Metrics.push(SharedConstants::AICHAT_METRICS_NAMESPACE,
      [
        {
          metric_name: "#{self.class.name}.Start",
          value: 1,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'ModelId', value: get_model_id(request)},
          ],
        }
      ]
    )
  end

  private def report_job_finish(request)
    execution_time = Time.now - @start_time
    status_name = SharedConstants::AI_REQUEST_EXECUTION_STATUS.key(request.execution_status).to_s

    execution_time_metric_base = {
      metric_name: "#{self.class.name}.ExecutionTime",
      value: execution_time,
      unit: 'Seconds',
      timestamp: Time.now,
      dimensions: [],
    }

    execution_time_dimensions_base = [
      {name: 'Environment', value: CDO.rack_env},
      {name: 'ModelId', value: get_model_id(request)},
    ]

    metrics = [
      {
        metric_name: "#{self.class.name}.Finish",
        value: 1,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [
          {name: 'Environment', value: CDO.rack_env},
          {name: 'ModelId', value: get_model_id(request)},
          {name: 'ExecutionStatus', value: status_name},
        ],
      },
      execution_time_metric_base.merge({dimensions: execution_time_dimensions_base}),
    ]

    model_id = get_model_id(request)
    if openai_or_gemini?(model_id)
      multimodal_dimension = {name: 'Multimodal', value: request_multimodal?(request).to_s}
      execution_time_metric_multimodal = execution_time_metric_base.merge({dimensions: execution_time_dimensions_base + [multimodal_dimension]})
      metrics.push(execution_time_metric_multimodal)
    end

    Cdo::Metrics.push(SharedConstants::AICHAT_METRICS_NAMESPACE, metrics)
  end
end
