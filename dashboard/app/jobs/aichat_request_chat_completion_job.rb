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
    level_id = request.level_id
    status, response = get_execution_status_and_response(model_customizations, stored_messages, new_message, level_id, locale)
    request.update!(response: response, execution_status: status)
  end

  private def create_comprehend_client
    Aws::Comprehend::Client.new
  end

  private def get_execution_status_and_response(model_customizations, stored_messages, new_message, level_id, locale)
    comprehend_client = create_comprehend_client

    # Check input for profanity and PII
    user_profanity = comprehend_toxicity(new_message[:chatMessageText], locale, comprehend_client)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], "Profanity detected in user input: #{user_profanity}"] if user_profanity

    user_pii = find_pii(new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PII], "PII detected in user input: #{user_pii}"] if user_pii

    # Make the request
    response = AichatSagemakerHelper.get_sagemaker_assistant_response(model_customizations, stored_messages, new_message, level_id)

    # Check output for profanity and PII. Report to HoneyBadger if the model returned profanity.
    model_profanity = comprehend_toxicity(response, locale, comprehend_client)
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

  # Moderate given text for inappropriate/toxic content using AWS Comprehend client.
  private def comprehend_toxicity(text, locale, comprehend_client)
    response = comprehend_client.detect_toxic_content(
      {
        text_segments: [{text: text}],
        language_code: locale,
      }
    )
    puts "Comprehend response: #{response}"
    puts "response.result_list #{response.result_list}"
    puts "response.result_list[0].labels #{response.result_list[0].labels}"
    puts "response.result_list[0].labels[0].name #{response.result_list[0].labels[0].name}"
    puts "response.result_list[0].labels[0].score #{response.result_list[0].labels[0].score}"
    puts "response.result_list[0].toxicity #{response.result_list[0].toxicity}"
  end

  # Check the given text for PII
  private def find_pii(text, locale)
    # TODO: Use llm-guard to check for PII. Currently we don't check for PII to maintain consistency with existing code.
  end
end
