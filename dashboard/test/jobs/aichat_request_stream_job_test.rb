require "test_helper"

class AichatRequestStreamJobTest < ActiveJob::TestCase
  include ActionCable::TestHelper

  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  setup do
    @locale = 'en'
    @student = create(:student)
    @stream_name = 'test-stream'

    AichatSafetyHelper.stubs(:find_toxicity).returns(nil)
    AichatAiHelper.stubs(:report_job_start)
    AichatAiHelper.stubs(:report_job_finish)
    Honeybadger.stubs(:notify)
  end

  test 'execution status is set to QUEUED before perform' do
    request = create(:aichat_request, user_id: @student.id)

    AichatRequestStreamJob.perform_later(request: request, stream_name: @stream_name, locale: @locale)

    assert_equal STATUS[:QUEUED], request.reload.execution_status
  end

  test 'streams deltas and completes with success' do
    request = create(:aichat_request, user_id: @student.id)
    captured = broadcasts(@stream_name)

    AichatAiHelper.expects(:stream_assistant_response).with(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      request.level_id,
      request.project_id,
      request.user_id
    ).multiple_yields('Hello', '', nil, ' world').returns('Hello world')

    perform_enqueued_jobs do
      AichatRequestStreamJob.perform_later(request: request, stream_name: @stream_name, locale: @locale)
    end

    assert_equal STATUS[:SUCCESS], request.reload.execution_status
    assert_equal 'Hello world', request.response
    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'delta', text: 'Hello', request_id: request.id, seq: 1},
      {event: 'delta', text: ' world', request_id: request.id, seq: 2},
      {event: 'complete', text: 'Hello world', request_id: request.id},
    ], normalize_broadcasts(captured)
  end

  test 'sets user profanity when user input is toxic' do
    request = create(:aichat_request, user_id: @student.id)
    toxicity = {text: 'bad words', blocked_by: 'openai'}
    captured = broadcasts(@stream_name)

    AichatSafetyHelper.expects(:find_toxicity).with(
      request.new_message['chatMessageText'],
      request.level_id,
      'User'
    ).returns(toxicity)
    AichatAiHelper.expects(:stream_assistant_response).never

    perform_enqueued_jobs do
      AichatRequestStreamJob.perform_later(request: request, stream_name: @stream_name, locale: @locale)
    end

    assert_equal STATUS[:USER_PROFANITY], request.reload.execution_status
    assert_equal toxicity.to_json, request.response
    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'error', code: STATUS[:USER_PROFANITY], details: toxicity.to_json, request_id: request.id},
    ], normalize_broadcasts(captured)
  end

  test 'sets model profanity when output is toxic' do
    request = create(:aichat_request, user_id: @student.id)
    toxicity = {text: 'bad words', blocked_by: 'openai'}
    captured = broadcasts(@stream_name)

    AichatSafetyHelper.expects(:find_toxicity).with(
      request.new_message['chatMessageText'],
      request.level_id,
      'User'
    ).returns(nil)
    AichatSafetyHelper.expects(:find_toxicity).with(
      'Hello world',
      request.level_id,
      'Assistant'
    ).returns(toxicity)

    AichatAiHelper.expects(:stream_assistant_response).with(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      request.level_id,
      request.project_id,
      request.user_id
    ).multiple_yields('Hello', ' world').returns('Hello world')

    perform_enqueued_jobs do
      AichatRequestStreamJob.perform_later(request: request, stream_name: @stream_name, locale: @locale)
    end

    assert_equal STATUS[:MODEL_PROFANITY], request.reload.execution_status
    assert_equal toxicity.to_json, request.response
    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'delta', text: 'Hello', request_id: request.id, seq: 1},
      {event: 'delta', text: ' world', request_id: request.id, seq: 2},
      {event: 'error', code: STATUS[:MODEL_PROFANITY], details: toxicity.to_json, request_id: request.id},
    ], normalize_broadcasts(captured)
  end

  test 'sets model timeout when streaming times out' do
    request = create(:aichat_request, user_id: @student.id)
    captured = broadcasts(@stream_name)

    AichatSafetyHelper.expects(:find_toxicity).with(
      request.new_message['chatMessageText'],
      request.level_id,
      'User'
    ).returns(nil)
    AichatAiHelper.expects(:stream_assistant_response).
      raises(OpenaiUserInputResponseTimeout.new('Timeout'))

    perform_enqueued_jobs do
      AichatRequestStreamJob.perform_later(request: request, stream_name: @stream_name, locale: @locale)
    end

    assert_equal STATUS[:MODEL_TIMEOUT], request.reload.execution_status
    assert_equal 'Timeout', request.response
    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'error', code: STATUS[:MODEL_TIMEOUT], details: 'Timeout', request_id: request.id},
    ], normalize_broadcasts(captured)
  end

  test 'sets failure and re-raises when an unexpected error occurs' do
    request = create(:aichat_request, user_id: @student.id)
    captured = broadcasts(@stream_name)

    AichatSafetyHelper.expects(:find_toxicity).with(
      request.new_message['chatMessageText'],
      request.level_id,
      'User'
    ).returns(nil)
    AichatAiHelper.expects(:stream_assistant_response).raises(StandardError.new('boom'))

    error = assert_raises(StandardError) do
      AichatRequestStreamJob.perform_now(request: request, stream_name: @stream_name, locale: @locale)
    end

    assert_equal 'boom', error.message
    assert_equal STATUS[:FAILURE], request.reload.execution_status
    assert_includes request.response, 'boom'

    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'error', code: STATUS[:FAILURE], details: 'boom', request_id: request.id},
    ], normalize_broadcasts(captured)
  end

  private def normalize_broadcasts(captured)
    captured.
      map do |payload|
        if payload.is_a?(String)
          JSON.parse(payload).deep_symbolize_keys
        else
          payload.deep_symbolize_keys
        end
      end
  end
end
