# == Schema Information
#
# Table name: quiz_questions
#
#  id            :bigint           not null, primary key
#  type          :string(255)      not null
#  question_key  :string(36)       not null
#  parent_id     :bigint
#  question_name :string(255)      not null
#  question      :json             not null
#  explanation   :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_quiz_questions_on_parent_id      (parent_id)
#  index_quiz_questions_on_question_key   (question_key)
#  index_quiz_questions_on_question_name  (question_name)
#
class FreeResponseQuestion < QuizQuestion
  # Open-ended text response. Never auto-graded.
  #
  # `question` shape:
  #   {"stem" => "Describe your favorite algorithm."}
  validate :validate_question_shape

  private def validate_question_shape
    return if question.blank?
    q = question.deep_stringify_keys

    unless q['stem'].is_a?(String) && q['stem'].present?
      errors.add(:question, 'must have a non-blank "stem"')
    end
  end
end
