# == Schema Information
#
# Table name: learning_goal_evidence_levels
#
#  id                  :bigint           not null, primary key
#  learning_goal_id    :integer          not null
#  understanding       :integer          not null
#  teacher_description :text(65535)
#  ai_prompt           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_learning_goal_evidence_levels_on_lg_id_and_understanding  (learning_goal_id,understanding) UNIQUE
#
class LearningGoalEvidenceLevel < ApplicationRecord
  belongs_to :learning_goal

  validates :understanding, presence: true, inclusion: {in: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.to_h.values}

  def summarize
    {
      id: id,
      understanding: understanding,
      teacherDescription: teacher_description
    }
  end

  def seeding_key(seed_context)
    my_learning_goal = seed_context.learning_goals.find {|lg| lg.id == learning_goal_id}
    my_key = {
      understanding: understanding
    }
    learning_goal_seeding_key = my_learning_goal.seeding_key(seed_context)
    my_key.merge!(learning_goal_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
  end
end
