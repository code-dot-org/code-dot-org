require 'cdo/aws/metrics'

class AichatRequestChatCompletionJob < ApplicationJob
  queue_as :default

  DEFAULT_TOXICITY_THRESHOLD_USER_INPUT = 0.2
  DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT = 0.6
  METRICS_NAMESPACE = 'GenAICurriculum'.freeze

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

  # Catch any exceptions that occur during the job and update the request status accordingly
  rescue_from Exception do |exception|
    if rack_env?(:development)
      puts "AichatRequestChatCompletionJob Error: #{exception.full_message}"
    end

    request = arguments.first[:request]
    request.update!(response: exception.message, execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE])
    Honeybadger.notify(
      "AichatRequestChatCompletionJob failed with unexpected error: #{exception.message}",
      context: {
        request: request.to_json
      }
    )

    # Report metrics for the failed job (after_perform doesn't run on failure)
    report_job_finish(request)

    # Raise an exception to notify our system of the failed job.
    raise "AichatRequestChatCompletionJob failed with unexpected error: #{exception.message}. Context: #{request.to_json}"
  end

  def perform(request:, locale:)
    model_customizations = JSON.parse(request.model_customizations, {symbolize_names: true})
    stored_messages = JSON.parse(request.stored_messages, {symbolize_names: true})
    new_message = JSON.parse(request.new_message, {symbolize_names: true})
    level_id = request.level_id
    status, response = get_execution_status_and_response(model_customizations, stored_messages, new_message, level_id, locale)
    request.update!(response: response, execution_status: status)
  end

  private def get_execution_status_and_response(model_customizations, stored_messages, new_message, level_id, locale)
    # Moderate user input for toxicity.
    user_toxicity = AichatSafetyHelper.find_toxicity('user', new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], user_toxicity.to_json] if user_toxicity

    user_pii = find_pii(new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PII], "PII detected in user input: #{user_pii}"] if user_pii

    # Make the request.
    begin
      response = AichatSagemakerHelper.get_sagemaker_assistant_response(model_customizations, stored_messages, new_message, level_id)
    rescue Aws::SageMakerRuntime::Errors::ModelError => exception
      # If the user input was too large, return a USER_INPUT_TOO_LARGE status code. Otherwise, re-raise the exception.
      if exception.message.include?("must have less than 3000 tokens") || exception.message.include?("must be <= 4096")
        return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_INPUT_TOO_LARGE], exception.message]
      else
        raise exception
      end
    end

    # Moderate model output for toxicity.
    model_toxicity = AichatSafetyHelper.find_toxicity('assistant', response, locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], model_toxicity.to_json] if model_toxicity

    model_pii = find_pii(response, locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PII], "PII detected in model output: #{model_pii}"] if model_pii

    [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], response]
  end

  # Check the given text for PII.
  private def find_pii(text, locale)
    # TODO: Check for PII. Currently we don't check for PII but we plan to add post-launch.
  end

  private def get_model_id(request)
    JSON.parse(request.model_customizations, {symbolize_names: true})[:selectedModelId]
  end

  private def report_job_start(request)
    @start_time = Time.now
    AichatMetrics.report_aichat_job(metric_name: "#{self.class.name}.Start", model_id: get_model_id(request))
  end

  private def report_job_finish(request)
    execution_time = Time.now - @start_time
    status_name = SharedConstants::AI_REQUEST_EXECUTION_STATUS.key(request.execution_status).to_s
    AichatMetrics.report_aichat_job(metric_name: "#{self.class.name}.Finish", model_id: get_model_id(request), execution_status: status_name)
    AichatMetrics.report_aichat_job_execution(metric_name: "#{self.class.name}.ExecutionTime", model_id: get_model_id(request), execution_time: execution_time)
  end
end
