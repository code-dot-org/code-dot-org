# Reports LLM call data to Langfuse for observability.
# Follows the same optional-reporter pattern as AichatAiUsageReporter.
# Only the user's message text is logged (not system prompts or history).
class AichatLangfuseReporter
  def initialize(model_id, user_id, level_id, client_type)
    @model_id = model_id
    @user_id = user_id
    @level_id = level_id
    @client_type = client_type
  end

  def report(input:, output:, usage:, start_time:, end_time:)
    langfuse_client.create_trace_and_generation(
      trace_name: "aichat-completion",
      generation_name: "llm-call",
      model: @model_id,
      user_id: @user_id&.to_s,
      input: input,
      output: output,
      usage: {
        input: usage['prompt_tokens'],
        output: usage['completion_tokens'],
        unit: "TOKENS",
      },
      metadata: {
        level_id: @level_id,
        client_type: @client_type,
      },
      tags: [@client_type].compact,
      start_time: start_time,
      end_time: end_time,
    )
  rescue => e
    Rails.logger.warn("AichatLangfuseReporter failed: #{e.message}")
  end

  private def langfuse_client
    LangfuseClientHelper::Client.new(
      CDO.tutor_langfuse_secret_key,
      CDO.tutor_langfuse_public_key
    )
  end
end
