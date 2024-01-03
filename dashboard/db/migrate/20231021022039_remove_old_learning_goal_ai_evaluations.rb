class RemoveOldLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  class OldLearningGoalAiEvaluation < ApplicationRecord
    class OldLearningGoalAiEvaluation < ApplicationRecord
      belongs_to :learning_goal
      belongs_to :user
      belongs_to :requester, class_name: 'User'
    end
  end

  def up
    # Move over the data
    OldLearningGoalAiEvaluation.all.each do |old_lg|
      # Find any existing RubricAiEvaluation
      rubric_ai_evaluation = RubricAiEvaluation.find_by(
        project_id: old_lg.project_id,
        project_version: old_lg.project_version,
        user_id: old_lg.user_id
      )

      # Create a RubricAiEvaluation for every unique set of learning goal properties
      rubric_ai_evaluation ||= RubricAiEvaluation.create!(
        user_id: old_lg.user_id,
        requester_id: old_lg.requester_id || old_lg.user_id,
        project_id: old_lg.project_id,
        project_version: old_lg.project_version,
        rubric: LearningGoal.find(old_lg.learning_goal_id).rubric,
        status: 1,
        created_at: old_lg.created_at,
        updated_at: old_lg.updated_at
      )

      # Create the new record from the old
      LearningGoalAiEvaluation.create!(
        rubric_ai_evaluation: rubric_ai_evaluation,
        learning_goal_id: old_lg.learning_goal_id,
        ai_confidence: old_lg.ai_confidence,
        understanding: old_lg.understanding,
        created_at: old_lg.created_at,
        updated_at: old_lg.updated_at
      )
    end
  end

  def down
  end
end
