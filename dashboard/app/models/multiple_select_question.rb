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
#  index_quiz_questions_on_parent_id     (parent_id)
#  index_quiz_questions_on_question_key  (question_key)
#
class MultipleSelectQuestion < QuizQuestion
  # One or more correct answers chosen from a list of choices.
  #
  # `question` shape:
  #   {
  #     "stem" => "Select all even numbers.",
  #     "choices" => [{"id" => "a", "text" => "1"}, {"id" => "b", "text" => "2"}, ...],
  #     "correct_choice_ids" => ["b", "d"]
  #   }
  #
  # Choices are keyed by a stable `id`, not by text or position. Grading
  # compares the student's response as a *set* of ids, not an ordered list, so
  # selecting the same correct choices in a different order still counts as
  # equivalent - see the multi-select ordering problem in the design doc.
  validate :validate_question_shape

  def auto_gradable?
    true
  end

  # response_data shape: {"selectedChoiceIds" => ["b", "d"]}. Compared as
  # sets, not ordered lists - see the class comment above.
  def grade(response_data)
    selected = response_data.is_a?(Hash) ? response_data['selectedChoiceIds'] : nil
    selected = [] unless selected.is_a?(Array)
    correct = Set.new(question['correct_choice_ids'] || [])
    {score: Set.new(selected) == correct ? 1 : 0, max_score: 1}
  end

  private def validate_question_shape
    return if question.blank?
    q = question.deep_stringify_keys

    unless q['stem'].is_a?(String) && q['stem'].present?
      errors.add(:question, 'must have a non-blank "stem"')
      return
    end

    choice_ids = validate_choices(q['choices'])
    return if choice_ids.nil?

    correct_choice_ids = q['correct_choice_ids']
    unless correct_choice_ids.is_a?(Array) && correct_choice_ids.present?
      errors.add(:question, 'must have a non-empty "correct_choice_ids"')
      return
    end

    unless correct_choice_ids.uniq.length == correct_choice_ids.length
      errors.add(:question, '"correct_choice_ids" must not contain duplicates')
      return
    end

    unless (correct_choice_ids - choice_ids).empty?
      errors.add(:question, '"correct_choice_ids" must all reference a choice in "choices"')
    end
  end
end
