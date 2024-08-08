require "test_helper"

class AichatRequestChatCompletionJobTest < ActiveJob::TestCase
  setup do
    @student = create :student
    @model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}
    @new_message = {chatMessageText: 'hello', role: 'user', status: 'unknown', timestamp: Time.now.to_i}
  end

  test 'execution status is set to QUEUED before perform' do
    request = create_request
    AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED], request.reload.execution_status
  end

  test 'execution status is set to USER_PROFANITY if profanity is detected in the input' do
    profanity = 'expletive'
    ShareFiltering.stubs(:find_profanity_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, profanity))

    request = create_request
    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], request.reload.execution_status
    assert request.response.include?(profanity)
  end

  test 'execution status is set to MODEL_PROFANITY if profanity is detected in the output' do
    model_response = 'profane response'
    profanity = 'expletive'
    ShareFiltering.stubs(:find_profanity_failure).returns(nil)
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(model_response)
    ShareFiltering.stubs(:find_profanity_failure).with(model_response, 'en').returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, profanity))

    request = create_request
    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], request.reload.execution_status
    assert request.response.include?(profanity)
  end

  test 'execution status is set to SUCCESS if no profanity is detected' do
    model_response = 'response'
    ShareFiltering.stubs(:find_profanity_failure).returns(nil)
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(model_response)

    request = create_request
    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], request.reload.execution_status
    assert_equal model_response, request.response
  end

  test 'execution status is set to FAILURE if an unexpected error occurs' do
    error_message = 'error'
    ShareFiltering.stubs(:find_profanity_failure).returns(nil)
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).raises(StandardError.new(error_message))

    request = create_request
    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE], request.reload.execution_status
    assert request.response.include?(error_message)
  end

  private def create_request
    AichatRequest.create!(
      user_id: @student.id,
      level_id: 1,
      script_id: 1,
      project_id: 1,
      stored_messages: [].to_json,
      new_message: @new_message.to_json,
      model_customizations: @model_customizations.to_json,
    )
  end
end
