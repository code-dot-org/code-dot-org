class AddDetailsToAiTutorInteractionFeedback < ActiveRecord::Migration[6.1]
  def change
    add_column :ai_tutor_interaction_feedbacks, :details, :text
  end
end
