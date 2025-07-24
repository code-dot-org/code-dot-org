require 'test_helper'

class AichatSafetyHelperTest < ActionView::TestCase
  include AichatSafetyHelper

  ROLES = %w[user assistant].freeze
  SERVICES = %w[openai].freeze

  setup do
    openai_response_profanity_hash = {
      output: [
        {
          content: [
            {
              type: "output_text",
              text: "INAPPROPRIATE"
            }
          ],
          role: "assistant"
        }
      ]
    }
    openai_response_safe_hash = {
      output: [
        {
          content: [
            {
              type: "output_text",
              text: "OK"
            }
          ],
          role: "assistant"
        }
      ]
    }
    openai_response_invalid_hash = {
      output: [
        {
          content: [
            {
              type: "output_text",
              text: "INVALID"
            }
          ],
          role: "assistant"
        }
      ]
    }
    openai_response_structured_hash = {
      output: [
        {
          content: [
            {
              type: "output_text",
              text: {classification: "OK"}.to_json
            }
          ],
          role: "assistant"
        }
      ]
    }
    @openai_response_profanity_json = openai_response_profanity_hash.to_json
    @openai_response_safe_json = openai_response_safe_hash.to_json
    @openai_response_invalid_json = openai_response_invalid_hash.to_json
    @openai_response_structured_json = openai_response_structured_hash.to_json
    @profane_message = "profanity"
    @openai_response = {
      evaluation: "INAPPROPRIATE"
    }

    DCDO.stubs(:get).with("aichat_openai_system_prompt", anything).returns('simple')
    Policies::Courses.stubs(:modularity_enabled?).with(anything).returns(false)
    mock_response = create_stubbed_response(@openai_response_profanity_json)
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(mock_response)

    @english_script = create(:script, :with_levels, :in_single_unit_course, name: 'customizing-llms-2024')
    @spanish_script = create(:script, :with_levels, :in_single_unit_course, name: 'customizing-llms-latm-pilot')
  end

  ROLES.each do |role|
    SERVICES.each do |service|
      test "returns toxicity for #{role} input if detected using #{service}" do
        stub_safety_services(service, role)
        response = AichatSafetyHelper.find_toxicity(@profane_message, nil)
        verify_safety_response(service, response)
      end
    end
  end

  test "returns nil if no toxicity is detected" do
    mock_response = create_stubbed_response(@openai_response_safe_json)
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(mock_response)

    DCDO.stubs(:get).with("aichat_safety_profane_word_blocklist", anything).returns([])
    ROLES.each do |role|
      SERVICES.each do |service|
        stub_safety_services(service, role)
        response = AichatSafetyHelper.find_toxicity('clean message', nil)
        assert_nil response
      end
    end
  end

  test "request_safety_check returns a valid response.body the first time it is called" do
    stub_safety_services('openai', 'user')
    mock_response = create_stubbed_response(@openai_response_safe_json)
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(mock_response).once

    AichatSafetyHelper.find_toxicity('clean message', nil)
  end

  test "retries with structured response if request_safety_check fails first check" do
    stub_safety_services('openai', 'user')
    mock_response_invalid = create_stubbed_response(@openai_response_invalid_json)
    mock_structured_response = create_stubbed_response(@openai_response_structured_json)
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).
      returns(mock_response_invalid).
      returns(mock_structured_response)

    AichatSafetyHelper.find_toxicity('clean message', nil)
  end

  test "raises an error if request_safety_check returns a response.body other than INAPPROPRIATE or OK twice" do
    stub_safety_services('openai', 'user')
    mock_response = create_stubbed_response(@openai_response_invalid_json)
    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).returns(mock_response)

    assert_raises do
      AichatSafetyHelper.find_toxicity('clean message', nil)
    end
  end

  test "Open AI safety check uses American safety prompt if not in Spanish script" do
    stub_safety_services('openai', 'user')

    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).with do |input, _|
      assert_includes input[0][:content][0][:text], "American"
      return true
    end

    AichatSafetyHelper.find_toxicity('clean message', @english_script.levels.first)
  end

  test "Open AI safety check uses Spanish safety prompt if in Spanish script" do
    stub_safety_services('openai', 'user')

    AichatOpenaiResponsesHelper::Client.any_instance.stubs(:request_chat_completion).with do |input, _|
      assert_includes input[0][:content][0][:text], "Spanish"
      return true
    end

    AichatSafetyHelper.find_toxicity('clean message', @spanish_script.levels.first)
  end

  def stub_safety_services(enabled_service, enabled_role)
    %w[user assistant].each do |role|
      DCDO.stubs(:get).with("aichat_safety_openai_enabled_#{role}", anything).returns(enabled_service == 'openai' && role == enabled_role)
    end
  end

  def verify_safety_response(enabled_service, response)
    refute_nil response
    assert_equal @profane_message, response[:text]
    assert_equal enabled_service, response[:blocked_by]
    details = response[:details]
    case enabled_service
    when 'openai'
      assert_equal @openai_response, details
    end
  end

  def create_stubbed_response(body)
    stub(
      body: body,
      code: 200,
      success?: true
    )
  end
end
