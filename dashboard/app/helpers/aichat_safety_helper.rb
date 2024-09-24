# Provides functionality to detect toxicity in user input and model output used in the AI Chat Lab.
# Uses various services to check for profanity and toxicity based on DCDO settings.
module AichatSafetyHelper
  class ToxicityDetector
    DEFAULT_TOXICITY_THRESHOLD_USER_INPUT = 0.3
    DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT = 0.5
    VALID_EVALUATION_RESPONSES_SIMPLE = ['INAPPROPRIATE', 'OK']

    # Checks for toxicity in the given text using various services, determined by DCDO settings.
    # Returns {text: input (string), blocked_by: serviced that detected toxicity (string), details: filtering details (hash)}
    def find_toxicity(role, text, locale)
      if blocklist_enabled?(role)
        text.split.each do |word|
          return {text: text, blocked_by: 'blocklist', details: {blocked_word: word}} if profane_word_blocklist.include? word
        end
      end

      if webpurify_enabled?(role)
        profanity = ShareFiltering.find_profanity_failure(text, locale)
        return {text: text, blocked_by: 'webpurify', details: profanity.to_h} if profanity
      end

      if comprehend_enabled?(role)
        threshold = role == 'user' ? get_toxicity_threshold_user_input : get_toxicity_threshold_model_output
        comprehend_response = AichatComprehendHelper.get_toxicity(text, locale)
        return {text: text, blocked_by: 'comprehend', details: comprehend_response} if comprehend_response && comprehend_response[:toxicity] > threshold
      end

      if openai_enabled?(role)
        details = openai_safety_check(text)
        return {text: text, blocked_by: 'openai', details: details} if details
      end
    end

    private def openai_safety_check(text)
      details = nil
      # Try twice in case of network errors or model not correctly following directions and
      # replying with something other valid expected output.
      Retryable.retryable(tries: 2) do
        openai_response = OpenaiChatHelper.request_safety_check(text, get_safety_system_prompt)
        evaluation = JSON.parse(openai_response)['choices'][0]['message']['content']
        raise "Unexpected response from OpenAI: #{evaluation}" unless VALID_EVALUATION_RESPONSES_SIMPLE.include?(evaluation)
        if evaluation == 'INAPPROPRIATE'
          details = {
            text: text,
            evaluation: evaluation
          }
        end
      end
      details
    end

    private def comprehend_enabled?(role)
      DCDO.get("aichat_safety_comprehend_enabled_#{role}", false)
    end

    private def webpurify_enabled?(role)
      DCDO.get("aichat_safety_webpurify_enabled_#{role}", false)
    end

    private def openai_enabled?(role)
      DCDO.get("aichat_safety_openai_enabled_#{role}", true)
    end

    private def blocklist_enabled?(role)
      DCDO.get("aichat_safety_blocklist_enabled_#{role}", false)
    end

    private def profane_word_blocklist
      DCDO.get("aichat_safety_profane_word_blocklist", [])
    end

    private def get_toxicity_threshold_user_input
      DCDO.get("aichat_toxicity_threshold_user_input", DEFAULT_TOXICITY_THRESHOLD_USER_INPUT)
    end

    private def get_toxicity_threshold_model_output
      DCDO.get("aichat_toxicity_threshold_model_output", DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT)
    end

    private def get_safety_system_prompt
      'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.'
    end
  end

  def self.find_toxicity(role, text, locale)
    ToxicityDetector.new.find_toxicity(role, text, locale)
  end
end
