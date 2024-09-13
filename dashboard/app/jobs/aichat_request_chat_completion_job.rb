class AichatRequestChatCompletionJob < ApplicationJob
  queue_as :default

  DEFAULT_TOXICITY_THRESHOLD_USER_INPUT = 0.2
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

  private def get_toxicity_threshold_user_input
    DCDO.get("aichat_toxicity_threshold_user_input", DEFAULT_TOXICITY_THRESHOLD_USER_INPUT)
  end

  private def get_toxicity_threshold_model_output
    DCDO.get("aichat_toxicity_threshold_model_output", DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT)
  end

  private def get_execution_status_and_response(model_customizations, stored_messages, new_message, level_id, locale)
    # Moderate user input for toxicity.
    # get_toxicity returns an object with the following fields:
    # text: string, toxicity: number, and max_category {name: string, score: number}
    user_toxicity = find_toxicity(new_message[:chatMessageText], get_toxicity_threshold_user_input, locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], user_toxicity.to_json] if user_toxicity

    user_pii = find_pii(new_message[:chatMessageText], locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PII], "PII detected in user input: #{user_pii}"] if user_pii

    # Make the request.
    response = AichatSagemakerHelper.get_sagemaker_assistant_response(model_customizations, stored_messages, new_message, level_id)

    # Moderate model output for toxicity. Report to HoneyBadger if the model returns toxicity.
    model_toxicity = find_toxicity(response, get_toxicity_threshold_model_output, locale)
    if model_toxicity
      Honeybadger.notify(
        'Toxicity returned from aichat model (blocked before reaching student)',
        context: {
          response: response,
          flagged_content: model_toxicity.to_json,
        }
      )
      return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], model_toxicity.to_json]
    end

    model_pii = find_pii(response, locale)
    return [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PII], "PII detected in model output: #{model_pii}"] if model_pii

    [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], response]
  end

  # Checks for toxicity in the given text using various services, determined by DCDO settings.
  # Returns {text: input (string), blocked_by: serviced that detected toxicity (string), details: filtering details (hash)}
  private def find_toxicity(text, threshold, locale)
    if blocklist_enabled?
      text.split.each do |word|
        return {text: text, blocked_by: 'blocklist', details: {blocked_word: word}} if profane_word_blocklist.include? word
      end
    end

    if webpurify_enabled?
      profanity = ShareFiltering.find_profanity_failure(text, locale)
      return {text: text, blocked_by: 'webpurify', details: profanity.to_h} if profanity
    end

    if comprehend_enabled?
      comprehend_response = AichatComprehendHelper.get_toxicity(text, locale)
      return {text: text, blocked_by: 'comprehend', details: comprehend_response} if comprehend_response && comprehend_response[:toxicity] > threshold
    end
  end

  # Check the given text for PII.
  private def find_pii(text, locale)
    # TODO: Check for PII. Currently we don't check for PII but we plan to add post-launch.
  end

  private def comprehend_enabled?
    DCDO.get("aichat_safety_comprehend_enabled", true)
  end

  private def webpurify_enabled?
    DCDO.get("aichat_safety_webpurify_enabled", false)
  end

  private def blocklist_enabled?
    DCDO.get("aichat_safety_blocklist_enabled", false)
  end

  private def profane_word_blocklist
    DCDO.get("aichat_safety_profane_word_blocklist", [])
  end
end
