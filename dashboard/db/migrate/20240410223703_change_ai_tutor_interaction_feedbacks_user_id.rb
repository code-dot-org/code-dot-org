class ChangeAiTutorInteractionFeedbacksUserId < ActiveRecord::Migration[6.1]
  def change
    change_column :ai_tutor_interaction_feedbacks, :user_id, :integer
  end
end
