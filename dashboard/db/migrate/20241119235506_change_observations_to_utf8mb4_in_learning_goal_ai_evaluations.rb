class ChangeObservationsToUtf8mb4InLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def up
    # in order to increase from 3 to 4 bytes per character without increasing
    # the column size, we need to ensure there are no rows with observations
    # longer than 48K characters. However, any large observations add latency to
    # what we send to the client, and spot-checking reveals there aren't any
    # valid observations longer than 2K, so we'll set the limit to 4K.
    execute "update learning_goal_ai_evaluations set observations = '' where length(observations) > 4096"
    execute 'alter table learning_goal_ai_evaluations modify observations text charset utf8mb4 collate utf8mb4_unicode_ci'
  end

  def down
    execute 'alter table learning_goal_ai_evaluations modify observations text charset utf8 collate utf8_unicode_ci'
  end
end
