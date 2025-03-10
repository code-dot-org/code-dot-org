module AiSystemPrompts::EvaluateSystemPromptHelper
  def self.get_system_prompt(level, unit)
    evaluation_criteria = get_evaluation_criteria(level)
    evaluation_structure = <<~TEXT
      Please review the student's work. Respond in correctly formatted JSON.
      evaluationCriteria should just be a copy of #{evaluation_criteria}.
      aiEvaluation should be your assessment of the student's work. Respond with "great", "ok", or "needs revision".
      aiReasoning should be rovide one sentence with your reasoning.
    TEXT
    prompt = AiSystemPrompts::SystemPromptHelper.get_basic_system_prompt(level, unit)
    prompt << evaluation_structure
  end

  # TODO: As we develop the Learning Trajectory and the specifics of how each task should be evaluated,
  # we should update this method. Right now we're just defaulting to assessing against the level's instructions.
  def self.get_evaluation_criteria(level)
    level.properties["long_instructions"]
  end
end
