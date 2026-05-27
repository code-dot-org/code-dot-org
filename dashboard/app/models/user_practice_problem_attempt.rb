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
end
