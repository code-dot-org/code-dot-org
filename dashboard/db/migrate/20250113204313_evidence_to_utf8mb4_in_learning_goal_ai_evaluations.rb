class EvidenceToUtf8mb4InLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def up
    # in order to increase from 3 to 4 bytes per character without increasing
    # the column size, we need to ensure there are no rows with observations
    # longer than 48K characters. Spot-checking reveals the longest existing
    # entry is only 27K.
    execute 'alter table learning_goal_ai_evaluations modify evidence text charset utf8mb4 collate utf8mb4_unicode_ci'
  end

  def down
    execute 'alter table learning_goal_ai_evaluations modify evidence text charset utf8 collate utf8_unicode_ci'
  end
end
