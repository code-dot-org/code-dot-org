require "test_helper"

class AichatRequestChatCompletionJobTest < ActiveJob::TestCase
  setup do
    @student = create :student
    @model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}
    @new_message = {chatMessageText: 'hello', role: 'user', status: 'unknown', timestamp: Time.now.to_i}
    @blocklist_blocked_word = "blocked_profanity"
    @comprehend_response = {
      flagged_segment: 'comprehend-toxicity',
      toxicity: 0.9,
      max_category: {
        score: 0.7,
        name: "INSULT"
      }
    }
    @profane_message = "profanity hello #{@blocklist_blocked_word}"

    DCDO.stubs(:get).with("aichat_toxicity_threshold_user_input", anything).returns(AichatRequestChatCompletionJob::DEFAULT_TOXICITY_THRESHOLD_USER_INPUT)
    DCDO.stubs(:get).with("aichat_toxicity_threshold_model_output", anything).returns(AichatRequestChatCompletionJob::DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT)
    DCDO.stubs(:get).with("aichat_safety_profane_word_blocklist", anything).returns([@blocklist_blocked_word])

    stub_safety_services(nil, 'user')
  end

  test 'execution status is set to QUEUED before perform' do
    request = create :aichat_request
    AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED], request.reload.execution_status
  end

  %w[blocklist webpurify comprehend].each do |service|
    test "execution status is set to USER_PROFANITY if user input is blocked by #{service}" do
      stub_safety_services(service, 'user')
      request = create :aichat_request, new_message: {chatMessageText: @profane_message, role: 'user', status: 'unknown', timestamp: Time.now.to_i}.to_json
      perform_enqueued_jobs do
        AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
      end

      assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], request.reload.execution_status
      response = JSON.parse(request.response).deep_symbolize_keys
      verify_safety_response(service, response)
    end
  end

  %w[blocklist webpurify comprehend].each do |service|
    test "execution status is set to MODEL_PROFANITY if model response is blocked by #{service}" do
      stub_safety_services(service, 'assistant')
      request = create :aichat_request
      AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(@profane_message)
      perform_enqueued_jobs do
        AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
      end

      assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], request.reload.execution_status
      response = JSON.parse(request.response).deep_symbolize_keys
      verify_safety_response(service, response)
    end
  end

  test 'execution status is set to SUCCESS if no profanity is detected' do
    model_response = 'response'
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(model_response)

    request = create :aichat_request
    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], request.reload.execution_status
    assert_equal model_response, request.response
  end

  test 'execution status is set to FAILURE and an exception is raised if an unexpected error occurs' do
    error_message = 'error'
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).raises(StandardError.new(error_message))

    request = create :aichat_request
    exception = assert_raises(StandardError) do
      AichatRequestChatCompletionJob.perform_now(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE], request.reload.execution_status
    assert request.response.include?(error_message)
    assert exception.message.include?(error_message)
    assert exception.message.include?(request.to_json)
  end

  test 'execution status is set to USER_INPUT_TOO_LARGE and an exception is raised if the input validation error occurs' do
    error_message = 'Input validation error: `inputs` must have less than 3000 tokens'
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).raises(StandardError.new(error_message))

    request = create :aichat_request
    exception = assert_raises(StandardError) do
      AichatRequestChatCompletionJob.perform_now(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_INPUT_TOO_LARGE], request.reload.execution_status
    assert request.response.include?(error_message)
    assert exception.message.include?(error_message)
    assert exception.message.include?(request.to_json)
  end

  def stub_safety_services(enabled_service, role)
    DCDO.stubs(:get).with("aichat_safety_blocklist_enabled", anything).returns(enabled_service == 'blocklist')
    DCDO.stubs(:get).with("aichat_safety_webpurify_enabled", anything).returns(enabled_service == 'webpurify')
    DCDO.stubs(:get).with("aichat_safety_comprehend_enabled", anything).returns(enabled_service == 'comprehend')

    if role == 'user'
      ShareFiltering.stubs(:find_profanity_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'webpurify-profanity'))
      AichatComprehendHelper.stubs(:get_toxicity).returns(@comprehend_response)
    else
      # If assistant (not user), only return profanity response on the second call
      ShareFiltering.stubs(:find_profanity_failure).returns(nil, ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'webpurify-profanity'))
      AichatComprehendHelper.stubs(:get_toxicity).returns(nil, @comprehend_response)
    end
  end

  def verify_safety_response(enabled_service, response)
    assert_equal @profane_message, response[:text]
    assert_equal enabled_service, response[:blocked_by]
    details = response[:details]
    case enabled_service
    when 'blocklist'
      assert_equal @blocklist_blocked_word, details[:blocked_word]
    when 'webpurify'
      assert_equal ShareFiltering::FailureType::PROFANITY, details[:type]
      assert_equal 'webpurify-profanity', details[:content]
    when 'comprehend'
      assert_equal @comprehend_response, details
    end
  end
end
