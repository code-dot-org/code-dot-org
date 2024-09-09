class AichatRequestChatCompletionJob < ApplicationJob
  queue_as :default

  DEFAULT_TOXICITY_THRESHOLD_USER_INPUT = 0.25
  DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT = 0.6

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
    execution_status_code = SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE]
    if exception.message.include? "must have less than 3000 tokens"
      execution_status_code = SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_INPUT_TOO_LARGE]
    end

    request.update!(response: exception.message, execution_status: execution_status_code)
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

  private def get_toxicity_threshold_user_input
    DCDO.get("aws_comprehend_toxicity_threshold_user_input", DEFAULT_TOXICITY_THRESHOLD_USER_INPUT)
  end

  private def get_toxicity_threshold_model_output
    DCDO.get("aws_comprehend_toxicity_threshold_model_output", DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT)
  end

  private def get_execution_status_and_response(model_customizations, stored_messages, new_message, level_id, locale)
    comprehend_client = create_comprehend_client

    # Moderate user input for toxicity and PII
    user_comprehend_response = comprehend_toxicity(new_message[:chatMessageText], locale, comprehend_client)
    puts "user_comprehend_response: #{user_comprehend_response}"
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], "Profanity detected in user input: #{user_comprehend_response}"] if user_comprehend_response[:toxicity] > get_toxicity_threshold_user_input

    user_pii = find_pii(new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PII], "PII detected in user input: #{user_pii}"] if user_pii

    # Make the request
    response = AichatSagemakerHelper.get_sagemaker_assistant_response(model_customizations, stored_messages, new_message, level_id)

    # Moderate model output for toxicity and PII. Report to HoneyBadger if the model returned toxicity.
    model_comprehend_response = comprehend_toxicity(response, locale, comprehend_client)
    puts "model_comprehend_response: #{model_comprehend_response}"
    if model_comprehend_response[:toxicity] > get_toxicity_threshold_model_output
      Honeybadger.notify(
        'Toxicity returned from aichat model (blocked before reaching student)',
        context: {
          response: response,
          flagged_content: model_comprehend_response,
        }
      )
      return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], "Profanity detected in model output: #{model_comprehend_response}"]
    end

    model_pii = find_pii(response, locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PII], "PII detected in model output: #{model_pii}"] if model_pii

    [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], response]
  end

  # Moderate given text for inappropriate/toxic content using AWS Comprehend client.
  private def comprehend_toxicity(text, locale, comprehend_client)
    comprehend_response = comprehend_client.detect_toxic_content(
      {
        text_segments: [{text: text}],
        language_code: locale,
      }
    )
    categories = comprehend_response.result_list[0].labels
    {
      text: text,
      toxicity: comprehend_response.result_list[0].toxicity,
      max_category: categories.max_by(&:score),
    }
  end

  # Check the given text for PII
  private def find_pii(text, locale)
    # TODO: Use llm-guard to check for PII. Currently we don't check for PII to maintain consistency with existing code.
  end
end
