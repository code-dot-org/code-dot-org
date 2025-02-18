class CreateAiTutorInteractionFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :ai_tutor_interaction_feedbacks do |t|
      t.bigint :ai_tutor_interaction_id, null: false
      t.integer :user_id, null: false
      t.boolean :thumbs_up
      t.boolean :thumbs_down

      t.timestamps
    end

    add_foreign_key :ai_tutor_interaction_feedbacks, :ai_tutor_interactions
    add_foreign_key :ai_tutor_interaction_feedbacks, :users
    add_index :ai_tutor_interaction_feedbacks, [:ai_tutor_interaction_id, :user_id], unique: true, name: 'index_ai_tutor_feedback_on_interaction_and_user'
  end
end
