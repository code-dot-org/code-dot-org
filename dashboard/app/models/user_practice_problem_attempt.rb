# == Schema Information
#
# Table name: user_practice_problem_attempts
#
#  id                        :bigint           not null, primary key
#  user_id                   :bigint           not null
#  practice_problem_id       :bigint           not null
#  attempt                   :json             not null
#  correct                   :boolean          not null
#  ai_feedback               :text(65535)
#  delivery_context_type     :string(255)      not null
#  delivery_context_metadata :json
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#
# Indexes
#
#  index_user_practice_problem_attempts_on_practice_problem_id  (practice_problem_id)
#  index_user_practice_problem_attempts_on_user_id              (user_id)
#
class UserPracticeProblemAttempt < ApplicationRecord
  belongs_to :user
  belongs_to :practice_problem
  validates :delivery_context_type, inclusion: {in: SharedConstants::PRACTICE_PROBLEM_DELIVERY_CONTEXT.values}

  def summarize
    {
      id: id,
      user_id: user_id,
      practice_problem_id: practice_problem_id,
      attempt: attempt,
      correct: correct,
      ai_feedback: ai_feedback,
      delivery_context_type: delivery_context_type,
      delivery_context_metadata: delivery_context_metadata,
      created_at: created_at,
      updated_at: updated_at,
    }
  end
end
