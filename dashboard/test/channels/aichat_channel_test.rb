require 'test_helper'

class AichatChannelTest < ActionCable::Channel::TestCase
  include ActiveJob::TestHelper
  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  setup do
    @stream_id = 'test-stream'
    @user = create(:student)
    @stream = "aichat_stream:#{@user.id}:#{@stream_id}"
    stub_connection current_user: @user
    subscribe(stream_id: @stream_id)
    assert subscription.confirmed?
  end

  teardown do
    clear_enqueued_jobs
  end

  test 'streams start, deltas, and complete for gemini model' do
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil)

    AichatAiHelper.expects(:stream_assistant_response).
      with(any_parameters).
      multiple_yields(["Hello", {"raw" => 1}], [" world", {"raw" => 2}]).
      returns("Hello world")

    assert_difference 'AichatRequest.count', 1 do
      perform_enqueued_jobs do
        perform :request_completion, streaming_payload
      end
    end

    request = AichatRequest.last

    assert_equal(
      [
        {event: 'start', request_id: request.id},
        {event: 'delta', text: 'Hello', raw_event: {raw: 1}, request_id: request.id, seq: 1},
        {event: 'delta', text: ' world', raw_event: {raw: 2}, request_id: request.id, seq: 2},
        {event: 'complete', text: 'Hello world', request_id: request.id},
      ],
      parsed_broadcasts(@stream)
    )
  end

  test 'broadcasts error when user input is toxic' do
    toxicity = {text: 'bad words', blocked_by: 'openai'}
    AichatSafetyHelper.expects(:find_toxicity).returns(toxicity)
    AichatAiHelper.expects(:stream_assistant_response).never

    assert_difference 'AichatRequest.count', 1 do
      perform_enqueued_jobs do
        perform :request_completion, streaming_payload
      end
    end

    request = AichatRequest.last

    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'error', code: STATUS[:USER_PROFANITY], details: toxicity, request_id: request.id}
    ], parsed_broadcasts(@stream)

    assert_equal STATUS[:USER_PROFANITY], request.execution_status
  end

  test 'broadcasts error when model output is toxic' do
    toxicity = {text: 'bad words', blocked_by: 'openai'}
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil, toxicity)

    AichatAiHelper.expects(:stream_assistant_response).
      with(any_parameters).
      multiple_yields(["Hello", {"raw" => 1}], [" world", {"raw" => 2}]).
      returns("Hello world")

    assert_difference 'AichatRequest.count', 1 do
      perform_enqueued_jobs do
        perform :request_completion, streaming_payload
      end
    end

    request = AichatRequest.last

    assert_equal [
      {event: 'start', request_id: request.id},
      {event: 'delta', text: 'Hello', raw_event: {raw: 1}, request_id: request.id, seq: 1},
      {event: 'delta', text: ' world', raw_event: {raw: 2}, request_id: request.id, seq: 2},
      {event: 'error', code: STATUS[:MODEL_PROFANITY], details: toxicity, request_id: request.id}
    ], parsed_broadcasts(@stream)

    assert_equal STATUS[:MODEL_PROFANITY], request.execution_status
  end

  test 'broadcasts timeout error when model times out' do
    AichatSafetyHelper.expects(:find_toxicity).returns(nil)

    AichatAiHelper.expects(:stream_assistant_response).raises(OpenaiUserInputResponseTimeout.new('Timeout'))

    assert_difference 'AichatRequest.count', 1 do
      perform_enqueued_jobs do
        perform :request_completion, streaming_payload
      end
    end

    request = AichatRequest.last

    assert_equal(
      [
        {event: 'start', request_id: request.id},
        {event: 'error', code: STATUS[:MODEL_TIMEOUT], details: 'Timeout', request_id: request.id}
      ],
      parsed_broadcasts(@stream)
    )

    assert_equal STATUS[:MODEL_TIMEOUT], request.execution_status
  end

  test 'handles errors' do
    AichatSafetyHelper.expects(:find_toxicity).returns(nil)
    AichatAiHelper.expects(:stream_assistant_response).raises(ArgumentError.new('Streaming not supported'))

    assert_difference 'AichatRequest.count', 1 do
      perform_enqueued_jobs do
        perform :request_completion, streaming_payload
      end
    end

    request = AichatRequest.last

    assert_equal(
      [
        {event: 'start', request_id: request.id},
        {event: 'error', code: STATUS[:FAILURE], details: 'Streaming not supported', request_id: request.id}
      ],
      parsed_broadcasts(@stream)
    )

    assert_equal STATUS[:FAILURE], request.execution_status
  end

  test 'skips empty deltas' do
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil)

    AichatAiHelper.expects(:stream_assistant_response).
      with(any_parameters).
      # yield an empty string, nil, and a real value
      multiple_yields(["", {}], [nil, {}], ["Valid", {"raw" => 1}]).
      returns("Valid")

    perform_enqueued_jobs do
      perform :request_completion, streaming_payload
    end

    broadcasts = parsed_broadcasts(@stream)
    deltas = broadcasts.select {|b| b[:event] == 'delta'}

    # we yielded 3 times, but should only receive 1 delta
    assert_equal 1, deltas.count
    assert_equal 'Valid', deltas.first[:text]
  end

  private def streaming_payload
    {
      newMessage: {chatMessageText: 'hello tutor', role: 'user', status: 'unknown'},
      storedMessages: [
        {chatMessageText: 'prior', role: 'assistant', status: SharedConstants::AI_INTERACTION_STATUS[:OK]}
      ],
      modelParameters: {
        selectedModelId: SharedConstants::AI_CHAT_MODEL_IDS[:GEMINI_2_5_PRO],
        temperature: 0.5,
        clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]
      },
      aichatContext: {currentLevelId: 123, projectId: 456, clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]},
      locale: 'en'
    }
  end

  private def parsed_broadcasts(stream)
    broadcasts(stream).map do |payload|
      JSON.parse(payload).deep_symbolize_keys
    end
  end
end
