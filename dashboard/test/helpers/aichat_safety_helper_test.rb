require 'test_helper'

class AichatSafetyHelperTest < ActionView::TestCase
  include AichatSafetyHelper

  ROLES = %w[user assistant].freeze
  SERVICES = %w[blocklist webpurify comprehend openai].freeze
  TEST_THRESHOLD = 0.5

  setup do
    @blocklist_blocked_word = "blocked_profanity"
    @comprehend_response = {
      flagged_segment: 'comprehend-toxicity',
      toxicity: 0.9,
      max_category: {
        score: TEST_THRESHOLD + 0.1,
        name: "INSULT"
      }
    }
    openai_response_profanity_hash = {
      choices: [
        {
          message: {
            content: "INAPPROPRIATE"
          }
        }
      ]
    }
    openai_response_safe_hash = {
      choices: [
        {
          message: {
            content: "OK"
          }
        }
      ]
    }
    @openai_response_profanity_json = openai_response_profanity_hash.to_json
    @openai_response_safe_json = openai_response_safe_hash.to_json
    @openai_response = {
      evaluation: "INAPPROPRIATE"
    }
    @profane_message = "profanity hello #{@blocklist_blocked_word}"
    @webpurify_profanity = 'webpurify-profanity'

    DCDO.stubs(:get).with("aichat_toxicity_threshold_user_input", anything).returns(TEST_THRESHOLD)
    DCDO.stubs(:get).with("aichat_toxicity_threshold_model_output", anything).returns(TEST_THRESHOLD)
    DCDO.stubs(:get).with("aichat_safety_profane_word_blocklist", anything).returns([@blocklist_blocked_word])
    DCDO.stubs(:get).with("aichat_openai_system_prompt", anything).returns('simple')
    ShareFiltering.stubs(:find_profanity_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, @webpurify_profanity))
    AichatComprehendHelper.stubs(:get_toxicity).returns(@comprehend_response)
    OpenaiChatHelper.stubs(:request_safety_check).returns(@openai_response_profanity_json)
  end

  ROLES.each do |role|
    SERVICES.each do |service|
      test "returns toxicity for #{role} input if detected using #{service}" do
        stub_safety_services(service, role)
        response = AichatSafetyHelper.find_toxicity(role, @profane_message, 'en')
        verify_safety_response(service, response)
      end
    end
  end

  test "returns nil if no services are enabled for role" do
    stub_safety_services('comprehend', 'assistant')
    stub_safety_services('openai', 'assistant')
    response = AichatSafetyHelper.find_toxicity('user', 'message', 'en')
    assert_nil response
  end

  test "returns nil if no toxicity is detected" do
    AichatComprehendHelper.stubs(:get_toxicity).returns(nil)
    ShareFiltering.stubs(:find_profanity_failure).returns(nil)
    OpenaiChatHelper.stubs(:request_safety_check).returns(@openai_response_safe_json)
    DCDO.stubs(:get).with("aichat_safety_profane_word_blocklist", anything).returns([])
    ROLES.each do |role|
      SERVICES.each do |service|
        stub_safety_services(service, role)
        response = AichatSafetyHelper.find_toxicity(role, 'clean message', 'en')
        assert_nil response
      end
    end
  end

  def stub_safety_services(enabled_service, enabled_role)
    %w[user assistant].each do |role|
      DCDO.stubs(:get).with("aichat_safety_blocklist_enabled_#{role}", anything).returns(enabled_service == 'blocklist' && role == enabled_role)
      DCDO.stubs(:get).with("aichat_safety_webpurify_enabled_#{role}", anything).returns(enabled_service == 'webpurify' && role == enabled_role)
      DCDO.stubs(:get).with("aichat_safety_comprehend_enabled_#{role}", anything).returns(enabled_service == 'comprehend' && role == enabled_role)
      DCDO.stubs(:get).with("aichat_safety_openai_enabled_#{role}", anything).returns(enabled_service == 'openai' && role == enabled_role)
    end
  end

  def verify_safety_response(enabled_service, response)
    refute_nil response
    assert_equal @profane_message, response[:text]
    assert_equal enabled_service, response[:blocked_by]
    details = response[:details]
    case enabled_service
    when 'blocklist'
      assert_equal @blocklist_blocked_word, details[:blocked_word]
    when 'webpurify'
      assert_equal ShareFiltering::FailureType::PROFANITY, details[:type]
      assert_equal @webpurify_profanity, details[:content]
    when 'comprehend'
      assert_equal @comprehend_response, details
    when 'openai'
      assert_equal @openai_response, details
    end
  end
end
