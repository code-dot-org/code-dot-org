module AiSystemPrompts::EvaluateSystemPromptHelper
  def self.get_system_prompt(level, evaluation_type)
    additional_directions = level.respond_to?(:additional_ai_evaluation_instructions) && level.additional_ai_evaluation_instructions.present? ? level.additional_ai_evaluation_instructions.strip + "\n" : ''
    evaluation_criteria = get_evaluation_criteria(level)
    task_context = "Your task is to review the student's work."
    if additional_directions.present?
      task_context << " #{additional_directions}"
    end
    single_student_evaluation_structure = <<~TEXT
      #{task_context} Respond in correctly formatted JSON.
      evaluationCriteria should be a copy of #{evaluation_criteria}.
      aiEvaluation should be your overall assessment of the student's work. Respond with #{SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]} if the student's answer is unrelated (e.g. “idk”, “I don't know”, "who cares", or "na"), off-topic. Respond with #{SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]} if the student's answer incorrectly answers the questions asked in the level instructions. Respond with #{SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]} if the student's answer accurately answers all parts of the questions asked or directions given in the level instructions. Respond with #{SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT]} if the student's work partially meets the requirements of the level instructions.
      aiReasoning should be one sentence with your reasoning.
    TEXT
    evaluation_structure = evaluation_type == SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT] ? single_student_evaluation_structure : section_summary_evaluation_structure
    prompt = AiSystemPrompts::SystemPromptHelper.get_basic_system_prompt(level)
    prompt << evaluation_structure
  end

  def self.get_evaluation_criteria(level)
    completion_criteria = "Did the student complete all of the requirements in the instructions?"
    evaluation_criteria = [completion_criteria]
    if level.upper_grades_programming_level?
      code_quality_criteria = "Does the code run without errors? Does the code follow best practices?"
      evaluation_criteria << code_quality_criteria
    end
    evaluation_criteria
  end
end
