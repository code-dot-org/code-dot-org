# == Schema Information
#
# Table name: learning_goal_evidence_levels
#
#  id                  :bigint           not null, primary key
#  learning_goal_id    :integer
#  understanding       :integer
#  teacher_description :text(65535)
#  ai_prompt           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
class LearningGoalEvidenceLevel < ApplicationRecord
end
