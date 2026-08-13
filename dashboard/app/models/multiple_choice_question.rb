# Exactly one correct answer chosen from a list of choices.
#
# `question` shape:
#   {
#     "stem" => "What is 2 + 2?",
#     "choices" => [{"id" => "a", "text" => "3"}, {"id" => "b", "text" => "4"}, ...],
#     "correct_choice_id" => "b"
#   }
#
# Choices are keyed by a stable `id`, not by text or position, so grading
# and editing don't break when choice text is reworded or reordered.
class MultipleChoiceQuestion < QuizQuestion
  validate :validate_question_shape

  private def validate_question_shape
    return if question.blank?
    q = question.deep_stringify_keys

    unless q['stem'].is_a?(String) && q['stem'].present?
      errors.add(:question, 'must have a non-blank "stem"')
      return
    end

    choice_ids = validate_choices(q['choices'])
    return if choice_ids.nil?

    correct_choice_id = q['correct_choice_id']
    unless correct_choice_id.is_a?(String) && choice_ids.include?(correct_choice_id)
      errors.add(:question, '"correct_choice_id" must reference one of the "choices"')
    end
  end
end
