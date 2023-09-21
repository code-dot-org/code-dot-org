# == Schema Information
#
# Table name: learning_goals
#
#  id            :bigint           not null, primary key
#  key           :string(255)      not null
#  position      :integer
#  rubric_id     :integer          not null
#  learning_goal :string(255)
#  ai_enabled    :boolean
#  tips          :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_learning_goals_on_rubric_id_and_key  (rubric_id,key) UNIQUE
#
class LearningGoal < ApplicationRecord
  belongs_to :rubric, inverse_of: :learning_goals
  has_many :learning_goal_evidence_levels, dependent: :destroy

  before_create :generate_key

  accepts_nested_attributes_for :learning_goal_evidence_levels

  def summarize
    {
      key: key,
      learningGoal: learning_goal,
      aiEnabled: ai_enabled,
      tips: tips,
      evidenceLevels: learning_goal_evidence_levels.map(&:summarize)
    }
  end

  def seeding_key(seed_context)
    my_rubric = seed_context.rubrics.find {|r| r.id == rubric_id}
    my_key = {
      'learning_goal.key': key
    }
    rubric_seeding_key = my_rubric.seeding_key(seed_context)
    my_key.merge!(rubric_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
  end

  def generate_key
    return if key.present?
    self.key = SecureRandom.uuid
  end

  def summarize_for_rubric_edit
    {
      id: id,
      rubricId: rubric_id,
      position: position,
      learningGoal: learning_goal,
      aiEnabled: ai_enabled,
      learningGoalEvidenceLevelsAttributes: learning_goal_evidence_levels.map(&:summarize_for_rubric_edit)
    }
  end
end
