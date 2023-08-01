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
  belongs_to :rubric
  has_many :learning_goal_evidence_levels, dependent: :destroy

  def seeding_key(seed_context)
    my_rubric = seed_context.rubrics.find {|r| r.id == rubric_id}
    my_key = {
      'learning_goal.key': key
    }
    rubric_seeding_key = my_rubric.seeding_key(seed_context)
    my_key.merge!(rubric_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
  end
end
