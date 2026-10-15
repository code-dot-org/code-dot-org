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
  # One or more correct answers chosen from a list of choices.
  #
  # `content` shape:
  #   {
  #     "question_title" => "What is 2 + 2?",
  #     "description" => "Markdown shown under the title. Optional.",
  #     "choices" => [{"id" => "0", "text" => "Option A"}, {"id" => "1", "text" => "Option B"}, ...],
  #     "correct_choice_ids" => ["0"],
  #     "select_multiple" => false
  #   }
  #
  # Without "select_multiple", the student selects one choice and there is
  # exactly one correct choice. With it, the student may select several.
  #
  # Choices are keyed by a stable `id`, not by text or position, so grading
  # and editing don't break when choice text is reworded or reordered.
  validate :validate_question_shape

  def auto_gradable?
    true
  end

  # response_data shape: {"selectedChoiceIds" => ["b"]}
  def answered?(response_data)
    response_data['selectedChoiceIds'].is_a?(Array) && response_data['selectedChoiceIds'].any?(&:present?)
  end

  # All or nothing: correct only if exactly the correct choices are selected.
  def grade(response_data)
    selected = response_data.is_a?(Hash) ? response_data['selectedChoiceIds'] : nil
    correct = selected.is_a?(Array) && selected.to_set == content['correct_choice_ids'].to_set
    {score: correct ? 1 : 0, max_score: 1}
  end

  def select_multiple?
    content['select_multiple'] == true
  end

  def self.content_from_builder_params(params)
    shared_content(params).merge(
      choices: (params[:choices] || []).map(&:to_h),
      correct_choice_ids: params[:correctChoiceIds] || [],
      select_multiple: ActiveModel::Type::Boolean.new.cast(params[:selectMultiple]) || false,
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
    shared_content_json.merge(choices: content['choices'], selectMultiple: select_multiple?)
  end

  private def validate_question_shape
    return if content.blank?
    q = content.deep_stringify_keys
    validate_shared_content(q)

    select_multiple = q['select_multiple']
    unless select_multiple.nil? || select_multiple == true || select_multiple == false
      errors.add(:content, '"select_multiple" must be true or false if given')
    end

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

    if !select_multiple && correct_choice_ids.length > 1
      errors.add(:content, '"correct_choice_ids" must list exactly one choice unless "select_multiple"')
    end
  end
end
