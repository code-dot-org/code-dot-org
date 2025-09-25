require 'cdo/aws/metrics'

# Provides functionality to detect toxicity in user input and model output used in the AI Chat Lab.
module AichatSafetyHelper
  API_KEY = CDO.openai_student_learning_api_key
  MODEL = SharedConstants::AICHAT_MODEL_VERSION

  class ToxicityDetector
    VALID_EVALUATION_RESPONSES_SIMPLE = ['INAPPROPRIATE', 'OK']

    # Returns {text: input (string), blocked_by: serviced that detected toxicity (string), details: filtering details (hash)}
    # We currently use OpenAI for content moderation.
    def find_toxicity(text, level_id)
      details = openai_safety_check(text, level_id)
      {text: text, blocked_by: 'openai', details: details} if details
    end

    # Used to check safety content given text with the given moderation system prompt.
    private def openai_safety_check(text, level_id)
      details = nil
      start_time = Time.now
      report_openai_safety_check("Start")
      attempts = 0
      input = safety_check_input(text, level_id)

      # Retry only on network-related exceptions
      response = Retryable.retryable(
        tries: 2,
        on: [Net::OpenTimeout, Net::ReadTimeout, SocketError, Errno::ECONNRESET]
      ) do
        attempts += 1
        client.request_chat_completion(input, 1)
      end
      raise "OpenAI request failed with status #{response.code}: #{response.body}" unless response.success?

      evaluation = JSON.parse(response.body)['output'][0]['content'][0]['text']
      unless VALID_EVALUATION_RESPONSES_SIMPLE.include?(evaluation)
        report_openai_safety_check("InvalidResponse")
        attempts +=1

        # Fallback to structured call (non-retryable)
        response = client.request_chat_completion(input, 0, options: {text: structured_response_format})
        raise "OpenAI structured request failed with status #{response.code}: #{response.body}" unless response.success?

        body = JSON.parse(response.body)
        raw_content = body.dig("output", 0, "content", 0, "text")

        begin
          parsed = JSON.parse(raw_content)
        rescue JSON::ParserError
          report_openai_safety_check("InvalidResponse")
          raise "Structured response was not valid JSON: #{raw_content}"
        end

        evaluation = parsed["classification"]

        unless VALID_EVALUATION_RESPONSES_SIMPLE.include?(evaluation)
          report_openai_safety_check("InvalidResponse")
          raise "Unexpected structured classification from OpenAI: #{evaluation}"
        end
      end

      if evaluation == 'INAPPROPRIATE'
        details = {evaluation: evaluation}
      end

      report_openai_safety_check("Finish", attempts)
      latency = Time.now - start_time
      report_openai_safety_latency(latency, attempts)
      details
    end

    private def client
      AichatOpenaiResponsesHelper::Client.new(API_KEY, MODEL)
    end

    private def get_safety_system_prompt(level_id)
      spanish_script_names = ['customizing-llms-latm-pilot']

      in_spanish_script = false
      if level_id
        level = Level.find_by(id: level_id)
        bubble_choice_parents = BubbleChoice.parent_levels(level.name)

        any_parent_in_spanish_script = bubble_choice_parents.any? do |pl|
          pl.script_levels.any? {|sl| spanish_script_names.include?(sl.script.name)}
        end
        level_in_spanish_script = level.script_levels.any? {|sl| spanish_script_names.include?(sl.script.name)}
        in_spanish_script = any_parent_in_spanish_script || level_in_spanish_script
      end

      "You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an #{in_spanish_script ? 'Spanish' : 'American'} public middle school classroom. Examples of inappropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`."
    end

    private def get_safety_system_prompt_version
      'V0'
    end

    # Format messages with text to be checked for safety and moderation system prompt.
    private def safety_check_input(text, level_id)
      [
        {
          role: "system",
          content: [{type: 'input_text', text: get_safety_system_prompt(level_id)}]
        },
        {
          role: "user",
          content: [{type: 'input_text', text: text}]
        }
      ]
    end

    private def structured_response_format
      {
        format: {
          name: "safety_evaluation",
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              classification: {
                type: "string",
                description: "Safety classification for school appropriateness",
                enum: ["OK", "INAPPROPRIATE"]
              }
            },
            required: ["classification"],
            additionalProperties: false
          }
        }
      }
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

  class StubbedToxicityDetector
    def find_toxicity(text, _)
      # Note that it's important that we use the word "Damn" here, as our UI tests specifically use this word
      # so that we can use a stubbed version of our toxicity detection service in CI environments (ie, Drone).
      text == 'Damn' ?
        {text: text, blocked_by: 'openai', details: {evaluation: 'INAPPROPRIATE'}} :
        nil
    end
  end

  def self.find_toxicity(text, level_id)
    # Stubbed toxicity detection allows UI tests (without the roundtrip to third-party moderation services) to run in CI environments
    Rails.application.config.respond_to?(:stub_aichat_external_services) && Rails.application.config.stub_aichat_external_services ?
      StubbedToxicityDetector.new.find_toxicity(text, nil) :
      ToxicityDetector.new.find_toxicity(text, level_id)
  end
end
