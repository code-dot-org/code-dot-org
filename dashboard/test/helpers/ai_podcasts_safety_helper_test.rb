require 'test_helper'

class AiPodcastsSafetyHelperTest < ActionView::TestCase
  setup do
    response_with_text = lambda do |text|
      {output: [{content: [{type: "output_text", text: text}], role: "assistant"}]}.to_json
    end
    @inappropriate_json = response_with_text.call("INAPPROPRIATE")
    @ok_json = response_with_text.call("OK")
    @invalid_json = response_with_text.call("INVALID")
    @structured_ok_json = response_with_text.call({classification: "OK"}.to_json)
  end

  test "find_toxicity returns flagged hash when OpenAI classifies the script as INAPPROPRIATE" do
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(stubbed_response(@inappropriate_json))

    result = AiPodcastsSafetyHelper::ToxicityDetector.new.find_toxicity('any-text', 'Model')

    refute_nil result
    assert_equal 'any-text', result[:text]
    assert_equal 'openai', result[:blocked_by]
    assert_equal({evaluation: 'INAPPROPRIATE'}, result[:details])
  end

  test "find_toxicity returns nil when OpenAI classifies the script as OK" do
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(stubbed_response(@ok_json))

    assert_nil AiPodcastsSafetyHelper::ToxicityDetector.new.find_toxicity('any-text', 'Model')
  end

  test "find_toxicity falls back to a structured request when the unstructured response is unrecognized" do
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).
      returns(stubbed_response(@invalid_json)).then.
      returns(stubbed_response(@structured_ok_json))

    assert_nil AiPodcastsSafetyHelper::ToxicityDetector.new.find_toxicity('any-text', 'Model')
  end

  test "find_toxicity raises when both unstructured and structured calls return unrecognized classifications" do
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(stubbed_response(@invalid_json))

    assert_raises(RuntimeError) do
      AiPodcastsSafetyHelper::ToxicityDetector.new.find_toxicity('any-text', 'Model')
    end
  end

  test "safety prompt frames the input as an AI-generated podcast for school-aged students with an INAPPROPRIATE/OK classification" do
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).with do |input, _, _|
      prompt = input.first[:content].first[:text]
      assert_includes prompt, 'podcast'
      assert_includes prompt, 'middle school'
      assert_includes prompt, 'INAPPROPRIATE'
      true
    end.returns(stubbed_response(@ok_json))

    AiPodcastsSafetyHelper::ToxicityDetector.new.find_toxicity('any-text', 'Model')
  end

  test "StubbedToxicityDetector flags only the literal text 'Damn'" do
    detector = AiPodcastsSafetyHelper::StubbedToxicityDetector.new

    assert_nil detector.find_toxicity('normal text', 'Model')
    refute_nil detector.find_toxicity('Damn', 'Model')
  end

  def stubbed_response(body)
    stub(body: body, code: 200, success?: true)
  end
end
