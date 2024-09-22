# Provides functionality to detect toxicity in user input and model output used in the AI Chat Lab.
# Uses various services to check for profanity and toxicity based on DCDO settings.
module AichatSafetyHelper
  class ToxicityDetector
    DEFAULT_TOXICITY_THRESHOLD_USER_INPUT = 0.3
    DEFAULT_TOXICITY_THRESHOLD_MODEL_OUTPUT = 0.5
    OPENAAI_SAFETY_SYSTEM_PROMPT_SIMPLE = 'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an American public middle school classroom. Examples of innapropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is innapropriate respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.'
    VALID_EVALUATION_RESPONSES = ['INAPPROPRIATE', 'OK']

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
        openai_response = OpenaiChatHelper.request_toxicity_detection(text, OPENAAI_SAFETY_SYSTEM_PROMPT_SIMPLE)
        puts "openai_response #{openai_response}"
        evaluation = JSON.parse(openai_response.body)['choices'][0]['message']['content']
        puts "evaluation #{evaluation}"
        raise "Unexpected response from OpenAI: #{evaluation}" unless VALID_EVALUATION_RESPONSES.include?(evaluation)
        return {text: text, blocked_by: 'openai', details: {}} if evaluation == 'INAPPROPRIATE'
      end
    end

    # Temporarily disable comprehend for testing
    private def comprehend_enabled?(role)
      DCDO.get("aichat_safety_comprehend_enabled_#{role}", false)
    end

    private def webpurify_enabled?(role)
      DCDO.get("aichat_safety_webpurify_enabled_#{role}", false)
    end

    # Temporarily enable openai for testing
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
  end

  def self.find_toxicity(role, text, locale)
    ToxicityDetector.new.find_toxicity(role, text, locale)
  end
end
