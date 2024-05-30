class AddFlaggedInappropriateToAiTutorInteractionFeedbacks < ActiveRecord::Migration[6.1]
  def change
    add_column :ai_tutor_interaction_feedbacks, :inappropriate, :boolean
    add_index :ai_tutor_interaction_feedbacks, :inappropriate
  end
end
