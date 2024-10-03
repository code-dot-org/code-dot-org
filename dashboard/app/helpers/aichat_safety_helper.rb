require 'cdo/aws/metrics'

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
      start_time = Time.now
      report_openai_safety_check("Start")
      # Try twice in case of network errors or model not correctly following directions and
      # replying with something other valid expected output.
      attempts = 1
      Retryable.retryable(tries: 2) do
        openai_response = OpenaiChatHelper.request_safety_check(text, get_safety_system_prompt)
        evaluation = JSON.parse(openai_response)['choices'][0]['message']['content']
        unless VALID_EVALUATION_RESPONSES_SIMPLE.include?(evaluation)
          report_openai_safety_check("InvalidResponse")
          attempts += 1
          raise "Unexpected response from OpenAI: #{evaluation}"
        end
        if evaluation == 'INAPPROPRIATE'
          details = {
            evaluation: evaluation
          }
        end
      end
      report_openai_safety_check("Finish", attempts)
      latency = Time.now - start_time
      report_openai_safety_latency(latency, attempts)
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

    private def get_safety_system_prompt_version
      'V0'
    end

    private def report_openai_safety_check(metric_name, num_attempts = 1)
      safety_dimensions = [
        {name: 'Environment', value: CDO.rack_env},
        {name: 'PromptVersion', value: get_safety_system_prompt_version},
      ]
      if metric_name == 'Finish'
        safety_dimensions << {name: 'Attempts', value: num_attempts.to_s}
      end
      Cdo::Metrics.push(SharedConstants::AICHAT_METRICS_NAMESPACE,
        [
          {
            metric_name: "AichatSafety.Openai.#{metric_name}",
            value: 1,
            unit: 'Count',
            timestamp: Time.now,
            dimensions: safety_dimensions
          }
        ]
      )
    end

    private def report_openai_safety_latency(latency, num_attempts)
      Cdo::Metrics.push(SharedConstants::AICHAT_METRICS_NAMESPACE,
        [
          {
            metric_name: "AichatSafety.Openai.Latency",
            value: latency,
            unit: 'Seconds',
            timestamp: Time.now,
            dimensions: [
              {name: 'Environment', value: CDO.rack_env},
              {name: 'PromptVersion', value: get_safety_system_prompt_version},
              {name: 'Attempts', value: num_attempts.to_s},
            ]
          }
        ]
      )
    end
  end

  def self.find_toxicity(role, text, locale)
    ToxicityDetector.new.find_toxicity(role, text, locale)
  end
end
