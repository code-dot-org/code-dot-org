class AichatRequestChatCompletionJob < ApplicationJob
  queue_as :default

  before_enqueue do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED])
  end

  before_perform do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:RUNNING])
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

    # Raise an exception to notify our system of the failed job.
    raise "AichatRequestChatCompletionJob failed with unexpected error: #{exception.message}. Context: #{request.to_json}"
  end

  def perform(request:, locale:)
    model_customizations = JSON.parse(request.model_customizations, {symbolize_names: true})
    stored_messages = JSON.parse(request.stored_messages, {symbolize_names: true})
    new_message = JSON.parse(request.new_message, {symbolize_names: true})

    status, response = get_execution_status_and_response(model_customizations, stored_messages, new_message, locale)
    request.update!(response: response, execution_status: status)
  end

  private def get_execution_status_and_response(model_customizations, stored_messages, new_message, locale)
    # Check input for profanity and PII
    user_profanity = find_profanity(new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], "Profanity detected in user input: #{user_profanity}"] if user_profanity

    user_pii = find_pii(new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PII], "PII detected in user input: #{user_pii}"] if user_pii

    # Make the request
    response = AichatSagemakerHelper.get_sagemaker_assistant_response(model_customizations, stored_messages, new_message)

    # Check output for profanity and PII. Report to HoneyBadger if the model returned profanity.
    model_profanity = find_profanity(response, locale)
    if model_profanity
      Honeybadger.notify(
        'Profanity returned from aichat model (blocked before reaching student)',
        context: {
          response: response,
          flagged_content: model_profanity,
        }
      )
      return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], "Profanity detected in model output: #{model_profanity}"]
    end

    model_pii = find_pii(response, locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PII], "PII detected in model output: #{model_pii}"] if model_pii

    [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], response]
  end

  # Check the given text for profanity
  private def find_profanity(text, locale)
    # TODO: Use llm-guard instead of WebPurify to check for profanity / toxicity.
    filter_result = ShareFiltering.find_profanity_failure(text, locale)
    filter_result.content if filter_result&.type == ShareFiltering::FailureType::PROFANITY
  end

  # Check the given text for PII
  private def find_pii(text, locale)
    # TODO: Use llm-guard to check for PII. Currently we don't check for PII to maintain consistency with existing code.
  end
end
