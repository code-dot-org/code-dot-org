# == Schema Information
#
# Table name: quiz_questions
#
#  id             :bigint           not null, primary key
#  type           :string(255)      not null
#  key            :string(36)       not null
#  fork_parent_id :bigint
#  name           :string(255)      not null
#  content        :json             not null
#  explanation    :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_quiz_questions_on_created_at  (created_at)
#  index_quiz_questions_on_key         (key)
#  index_quiz_questions_on_name        (name)
#
class MultipleChoiceQuestion < QuizQuestion
  # Exactly one correct answer chosen from a list of choices.
  #
  # `content` shape:
  #   {
  #     "question_title" => "What is 2 + 2?",
  #     "choices" => [{"id" => "0", "text" => "Option A"}, {"id" => "1", "text" => "Option B"}, ...],
  #     "correct_choice_id" => "0"
  #   }
  #
  # Choices are keyed by a stable `id`, not by text or position, so grading
  # and editing don't break when choice text is reworded or reordered.
  validate :validate_question_shape

  def auto_gradable?
    true
  end

  # response_data shape: {"selectedChoiceId" => "b"}
  def grade(response_data)
    selected = response_data.is_a?(Hash) ? response_data['selectedChoiceId'] : nil
    correct = selected.present? && selected == content['correct_choice_id']
    {score: correct ? 1 : 0, max_score: 1}
  end

  def self.content_from_builder_params(params)
    {
      question_title: params[:questionTitle],
      choices: (params[:choices] || []).map(&:to_h),
      correct_choice_id: params[:correctChoiceId],
    }
  end

  def builder_content_json
    attempt_content_json.merge(correctChoiceId: content['correct_choice_id'])
  end

  def attempt_content_json
    {questionTitle: content['question_title'], choices: content['choices']}
  end

  private def validate_question_shape
    return if content.blank?
    q = content.deep_stringify_keys

    unless q['question_title'].is_a?(String) && q['question_title'].present?
      errors.add(:content, 'must have a non-blank "question_title"')
      return
    end

    choice_ids = validate_choices(q['choices'])
    return if choice_ids.nil?

    correct_choice_id = q['correct_choice_id']
    unless correct_choice_id.is_a?(String) && choice_ids.include?(correct_choice_id)
      errors.add(:content, '"correct_choice_id" must reference one of the "choices"')
    end
  end
end
