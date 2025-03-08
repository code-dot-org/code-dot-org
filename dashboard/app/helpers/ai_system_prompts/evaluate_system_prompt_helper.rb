module AiSystemPrompts::EvaluateSystemPromptHelper
  def self.get_system_prompt(level, unit)
    evaluation_criteria = <<~TEXT
      Please review the student's work. Respond in correctly formatted JSON.
      evaluation_criteria should be a copy of: Is the answers "great", "ok", or "needs revision"?.
      ai_evaluation should be your assessment of the student's work.
      ai_reasoning should be rovide one sentence with your reasoning.
    TEXT
    prompt = AiSystemPrompts::SystemPromptHelper.get_basic_system_prompt(level, unit)
    prompt << evaluation_criteria
  end
end
