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
class FreeResponseQuestion < QuizQuestion
  # Open-ended written answer. Not auto-gradable; responses are stored
  # "ungraded" until manual/AI grading is built.
  #
  # `content` shape:
  #   {
  #     "question_title" => "Give one specific example of an abstraction you used during this lesson.",
  #     "description" => "An example of an abstraction is a function or class that encapsulates a concept or behavior."
  #   }
  #
  # "description" is optional rich text.
  validate :validate_question_shape

  def self.content_from_builder_params(params)
    shared_content(params)
  end

  def builder_content_json
    attempt_content_json
  end

  def attempt_content_json
    {questionTitle: content['question_title'], description: content['description']}
  end

  private def validate_question_shape
    return if content.blank?
    q = content.deep_stringify_keys

    unless q['question_title'].is_a?(String) && q['question_title'].present?
      errors.add(:content, 'must have a non-blank "question_title"')
    end

    unless q['description'].nil? || q['description'].is_a?(String)
      errors.add(:content, '"description" must be a string')
    end
  end
end
