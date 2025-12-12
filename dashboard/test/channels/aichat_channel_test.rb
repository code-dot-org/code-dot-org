require 'test_helper'

class AichatChannelTest < ActionCable::Channel::TestCase
  STATUS = SharedConstants::AI_REQUEST_EXECUTION_STATUS

  setup do
    @stream_id = 'test-stream'
    @user = create(:student)
    stub_connection current_user: @user
    subscribe(stream_id: @stream_id)
    assert subscription.confirmed?
  end

  test 'streams start, deltas, and complete for gemini model' do
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil)
    request = mock
    request.stubs(:id).returns(123)
    request.stubs(:update!)
    AichatRequest.stubs(:create!).returns(request)

    AichatAiHelper.expects(:stream_assistant_response).
      with(any_parameters).
      multiple_yields(["Hello", {"raw" => 1}], [" world", {"raw" => 2}]).
      returns("Hello world")

    stream = stream_name
    perform :request_completion, streaming_payload

    assert_equal(
      [
        {event: 'start', request_id: 123},
        {event: 'delta', text: 'Hello', raw_event: {raw: 1}, request_id: 123, seq: 1},
        {event: 'delta', text: ' world', raw_event: {raw: 2}, request_id: 123, seq: 2},
        {event: 'complete', text: 'Hello world', request_id: 123},
      ],
      parsed_broadcasts(stream)
    )
  end

  test 'broadcasts error when user input is toxic' do
    toxicity = {text: 'bad words', blocked_by: 'openai'}
    AichatSafetyHelper.expects(:find_toxicity).returns(toxicity)
    AichatAiHelper.expects(:stream_assistant_response).never
    request = mock
    request.stubs(:id).returns(456)
    request.stubs(:update!)
    AichatRequest.stubs(:create!).returns(request)

    stream = stream_name
    perform :request_completion, streaming_payload

    assert_equal [
      {event: 'start', request_id: 456},
      {event: 'error', code: STATUS[:USER_PROFANITY], details: toxicity, request_id: 456}
    ], parsed_broadcasts(stream)
  end

  test 'broadcasts error when model output is toxic' do
    toxicity = {text: 'bad words', blocked_by: 'openai'}
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil, toxicity)
    request = mock
    request.stubs(:id).returns(789)
    request.stubs(:update!)
    AichatRequest.stubs(:create!).returns(request)

    AichatAiHelper.expects(:stream_assistant_response).
      with(any_parameters).
      multiple_yields(["Hello", {"raw" => 1}], [" world", {"raw" => 2}]).
      returns("Hello world")

    stream = stream_name
    perform :request_completion, streaming_payload

    assert_equal [{event: 'start', request_id: 789},
                  {event: 'delta', text: 'Hello', raw_event: {raw: 1}, request_id: 789, seq: 1},
                  {event: 'delta', text: ' world', raw_event: {raw: 2}, request_id: 789, seq: 2},
                  {event: 'error', code: STATUS[:MODEL_PROFANITY], details: toxicity, request_id: 789}], parsed_broadcasts(stream)
  end

  test 'handles errors' do
    AichatSafetyHelper.expects(:find_toxicity).returns(nil)
    AichatAiHelper.expects(:stream_assistant_response).raises(ArgumentError.new('Streaming not supported'))
    request = mock
    request.stubs(:id).returns(789)
    request.stubs(:update!)
    AichatRequest.stubs(:create!).returns(request)

    stream = stream_name
    perform :request_completion, streaming_payload

    assert_equal(
      [
        {event: 'start', request_id: 789},
        {event: 'error', code: STATUS[:FAILURE], details: 'Streaming not supported', request_id: 789}
      ],
      parsed_broadcasts(stream)
    )
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

  private def stream_name
    "aichat_stream:#{@user.id}:#{@stream_id}"
  end
end
