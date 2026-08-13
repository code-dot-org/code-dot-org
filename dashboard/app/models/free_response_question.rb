# Open-ended text response. Never auto-graded; see
# QuizQuestionResponse#grading_status for how it gets scored.
#
# `question` shape:
#   {"stem" => "Describe your favorite algorithm."}
class FreeResponseQuestion < QuizQuestion
  validate :validate_question_shape

  private def validate_question_shape
    return if question.blank?
    q = question.deep_stringify_keys

    unless q['stem'].is_a?(String) && q['stem'].present?
      errors.add(:question, 'must have a non-blank "stem"')
    end
  end
end
