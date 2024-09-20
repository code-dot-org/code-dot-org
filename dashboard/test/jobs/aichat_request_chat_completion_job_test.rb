require "test_helper"

class AichatRequestChatCompletionJobTest < ActiveJob::TestCase
  setup do
    @locale = 'en'
    @student = create :student
    @model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}
    @new_message = {chatMessageText: 'hello', role: 'user', status: 'unknown', timestamp: Time.now.to_i}
    @toxic_response = {
      text: 'toxic',
      blocked_by: 'comprehend',
      details: {
        flagged_segment: 'toxic',
        max_category: {
          score: 0.7,
          name: 'INSULT'
        }
      }
    }

    AichatSafetyHelper.stubs(:find_toxicity).returns(nil)
  end

  test 'execution status is set to QUEUED before perform' do
    request = create :aichat_request
    AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED], request.reload.execution_status
  end

  test "execution status is set to USER_PROFANITY if toxicity detected in user input" do
    request = create :aichat_request
    user_message = JSON.parse(request.new_message, symbolize_names: true)[:chatMessageText]
    AichatSafetyHelper.expects(:find_toxicity).with('user', user_message, @locale).returns(@toxic_response)

    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: @locale)
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], request.reload.execution_status
    assert_equal @toxic_response.to_json, request.response
  end

  test "execution status is set to MODEL_PROFANITY if toxicity detected in model output" do
    AichatSafetyHelper.stubs(:find_toxicity).with('user', anything, anything).returns(nil)
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns('response')
    AichatSafetyHelper.stubs(:find_toxicity).with('assistant', anything, anything).returns(@toxic_response)

    request = create :aichat_request

    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], request.reload.execution_status
    assert_equal @toxic_response.to_json, request.response
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
end
