class DropAiTutorInteractionTables < ActiveRecord::Migration[6.1]
  def change
    drop_table :ai_tutor_interaction_feedbacks, if_exists: true
    drop_table :ai_tutor_interactions, if_exists: true
  end
end
