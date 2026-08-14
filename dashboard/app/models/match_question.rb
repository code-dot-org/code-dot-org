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
class MatchQuestion < QuizQuestion
  # Pairs of prompts and answers the student must match to each other.
  #
  # `question` shape:
  #   {
  #     "stem" => "Match each animal to its sound.",
  #     "pairs" => [
  #       {"id" => "1", "prompt" => "Cat", "answer" => "Meow"},
  #       {"id" => "2", "prompt" => "Dog", "answer" => "Bark"}
  #     ]
  #   }
  #
  # Each pair's `id` is what a student's response references when matching a
  # prompt to an answer; there's no separate "correct answer" field because
  # the pairing itself defines correctness.
  validate :validate_question_shape

  private def validate_question_shape
    return if question.blank?
    q = question.deep_stringify_keys

    unless q['stem'].is_a?(String) && q['stem'].present?
      errors.add(:question, 'must have a non-blank "stem"')
      return
    end

    pairs = q['pairs']
    unless pairs.is_a?(Array) && pairs.length >= 2
      errors.add(:question, 'must have at least 2 "pairs"')
      return
    end

    valid_shape = pairs.all? do |pair|
      pair.is_a?(Hash) && pair['id'].is_a?(String) && pair['prompt'].is_a?(String) && pair['answer'].is_a?(String)
    end
    unless valid_shape
      errors.add(:question, 'each pair must have a string "id", "prompt", and "answer"')
      return
    end

    pair_ids = pairs.map {|pair| pair['id']}
    unless pair_ids.uniq.length == pair_ids.length
      errors.add(:question, '"pairs" ids must be unique')
    end
  end
end
