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
class MultipleSelectQuestion < QuizQuestion
  # One or more correct answers chosen from a list of choices.
  #
  # `content` shape:
  #   {
  #     "question_title" => "Which of these are loops?",
  #     "description" => "Markdown shown under the title. Optional.",
  #     "choices" => [{"id" => "0", "text" => "for"}, {"id" => "1", "text" => "if"}, ...],
  #     "correct_choice_ids" => ["0", "2"]
  #   }
  validate :validate_question_shape

  def auto_gradable?
    true
  end

  # response_data shape: {"selectedChoiceIds" => ["0", "2"]}
  def answered?(response_data)
    response_data['selectedChoiceIds'].is_a?(Array) && response_data['selectedChoiceIds'].any?
  end

  # All or nothing: correct only if exactly the correct choices are selected.
  def grade(response_data)
    selected = response_data.is_a?(Hash) ? response_data['selectedChoiceIds'] : nil
    correct = selected.is_a?(Array) && selected.to_set == content['correct_choice_ids'].to_set
    {score: correct ? 1 : 0, max_score: 1}
  end

  def self.content_from_builder_params(params)
    shared_content_from_builder_params(params).merge(
      choices: (params[:choices] || []).map(&:to_h),
      correct_choice_ids: params[:correctChoiceIds] || [],
    )
  end

  def placeholder_content
    {
      'question_title' => "Placeholder question #{key} - encryption key missing",
      'choices' => [{'id' => 'a', 'text' => 'Placeholder choice A'}, {'id' => 'b', 'text' => 'Placeholder choice B'}],
      'correct_choice_ids' => ['a'],
    }
  end

  def answer_key_json
    {correctChoiceIds: content['correct_choice_ids']}
  end

  def builder_content_json
    attempt_content_json.merge(answer_key_json)
  end

  def attempt_content_json
    shared_content_json.merge(choices: content['choices'])
  end

  private def validate_question_shape
    return if content.blank?
    q = content.deep_stringify_keys
    validate_shared_content(q)

    choice_ids = validate_choices(q['choices'])
    return if choice_ids.nil?

    correct_choice_ids = q['correct_choice_ids']
    unless correct_choice_ids.is_a?(Array) && correct_choice_ids.any?
      errors.add(:content, '"correct_choice_ids" must list at least one choice')
      return
    end

    unless correct_choice_ids.uniq.length == correct_choice_ids.length && (correct_choice_ids - choice_ids).empty?
      errors.add(:content, '"correct_choice_ids" must be unique and reference the "choices"')
    end
  end
end
