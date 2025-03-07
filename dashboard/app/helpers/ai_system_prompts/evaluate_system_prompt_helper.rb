module AiSystemPrompts::EvaluateSystemPromptHelper
  def self.evaluation_available?(level)
    AiSystemPrompts::SystemPromptHelper.programming_level?(level) || level.type == 'FreeResponse'
  end
end
