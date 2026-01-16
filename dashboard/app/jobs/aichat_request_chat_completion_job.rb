class AichatRequestChatCompletionJob < ApplicationJob
  queue_as :default

  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  DEFAULT_TOXICITY_THRESHOLD_USER_INPUT = 0.2
  DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT = 0.6

  before_enqueue do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: STATUS[:QUEUED])
  end

  before_perform do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: STATUS[:RUNNING])
    AichatAiHelper.report_job_start(self.class.name, request)
  end

  after_perform do |job|
    request = job.arguments.first[:request]
    AichatAiHelper.report_job_finish(self.class.name, request)
  end

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
    request = arguments.first[:request]
    locale = arguments.first[:locale]

    AichatAiHelper.handle_error("AichatRequestChatCompletionJob", exception.message, request, locale)

    # Report metrics for the failed job (after_perform doesn't run on failure).
    AichatAiHelper.report_job_finish(self.class.name, request)

    # Re-raise error to notify our system of the failed job.
    raise exception
  end

  def perform(request:, locale:)
    status, response = get_execution_status_and_response(request, locale)
    request.update!(response: response, execution_status: status)
  end

  # Determine if one of the models handled by  `aichat_ai_client.rb`.

  private def get_execution_status_and_response(request, locale)
    # Moderate user input for toxicity.
    user_toxicity = AichatSafetyHelper.find_toxicity(request.new_message['chatMessageText'], request.level_id, 'User')
    return [STATUS[:USER_PROFANITY], user_toxicity.to_json] if user_toxicity

    user_pii = find_pii(request.new_message['chatMessageText'], locale)
    return [STATUS[:USER_PII], "PII detected in user input: #{user_pii}"] if user_pii

    # Make the request.
    if AichatAiHelper.openai_or_gemini?(request.model_customizations['selectedModelId'])
      begin
        response = make_openai_request(request)
      rescue OpenaiUserInputResponseTimeout => exception
        return [STATUS[:MODEL_TIMEOUT], exception.message]
      end
    else
      begin
        response = make_sagemaker_request(request)
      rescue Aws::SageMakerRuntime::Errors::ModelError => exception
        # If the user input was too large, return a USER_INPUT_TOO_LARGE status code. Otherwise, re-raise the exception.
        if exception.message.include?("must have less than 3000 tokens") || exception.message.include?("must be <= 4096")
          return [STATUS[:USER_INPUT_TOO_LARGE], exception.message]
        else
          raise exception
        end
      end
    end

    # Moderate model output for toxicity.
    model_toxicity = AichatSafetyHelper.find_toxicity(response, request.level_id, 'Assistant')
    return [STATUS[:MODEL_PROFANITY], model_toxicity.to_json] if model_toxicity

    model_pii = find_pii(response, locale)
    return [STATUS[:MODEL_PII], "PII detected in model output: #{model_pii}"] if model_pii

    [STATUS[:SUCCESS], response]
  end

  private def make_openai_request(request)
    AichatAiHelper.get_openai_assistant_response(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      request.level_id,
      request.project_id,
      request.user_id
    )
  end

  private def make_sagemaker_request(request)
    AichatSagemakerHelper.get_sagemaker_assistant_response(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      request.level_id
    )
  end

  # Check the given text for PII.
  private def find_pii(text, locale)
    # TODO: Check for PII. Currently we don't check for PII but we plan to add post-launch.
  end
end
