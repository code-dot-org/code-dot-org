module AiSystemPrompts::EvaluateSystemPromptHelper
  def self.get_system_prompt(level, unit, evaluation_type)
    evaluation_criteria = get_evaluation_criteria(level)
    single_student_evaluation_structure = <<~TEXT
      Please review the student's work. Respond in correctly formatted JSON.
      evaluationCriteria should just be a copy of #{evaluation_criteria}.
      aiEvaluation should be your assessment of the student's work. Respond with "great", "ok", or "needs revision".
      aiReasoning should be one sentence with your reasoning.
    TEXT
    section_summary_evaluation_structure = <<~TEXT
      Please review the evaluations of the student responses. Respond in correctly formatted JSON.
      evaluationCriteria should just be a copy of "Summarize".
      aiEvaluation should be your assessment of the class's overall work. Respond with "review the concept" or "move on to the next lesson".
      aiReasoning should be one sentence with your reasoning including the names of any students who need more help.`;
    TEXT
    evaluation_structure = evaluation_type == SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT] ? single_student_evaluation_structure : section_summary_evaluation_structure
    prompt = AiSystemPrompts::SystemPromptHelper.get_basic_system_prompt(level, unit)
    prompt << evaluation_structure
  end

  # TODO: As we develop the Learning Trajectory and the specifics of how each task should be evaluated,
  # we should update this method. Right now we're just defaulting to assessing against the level's instructions
  # or very generic criteria for programming levels.
  def self.get_evaluation_criteria(level)
    if level.upper_grades_programming_level?
      return "Does the code run without errors? Does the code follow best practices?"
    else
      return level.properties["long_instructions"]
    end
  end
end
