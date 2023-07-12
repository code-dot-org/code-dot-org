# == Schema Information
#
# Table name: learning_goals
#
#  id            :bigint           not null, primary key
#  key           :string(255)
#  position      :integer
#  rubric_id     :integer
#  learning_goal :string(255)
#  ai_enabled    :boolean
#  tips          :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
class LearningGoal < ApplicationRecord
  belongs_to :rubric
  has_many :learning_goal_evidence_levels, dependent: :destroy

  def serialize
    {
      key: key,
      position: position,
      learning_goal: learning_goal,
      ai_enabled: ai_enabled,
      tips: tips,
      learning_goal_evidence_levels: learning_goal_evidence_levels.map(&:serialize)
    }
  end
end
