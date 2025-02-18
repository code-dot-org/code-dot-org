class CreateAiTutorInteractions < ActiveRecord::Migration[6.1]
  def change
    create_table :ai_tutor_interactions do |t|
      t.integer :user_id, null: false, foreign_key: true
      t.integer :level_id, foreign_key: true
      t.integer :script_id, foreign_key: true
      t.string :ai_model_version
      t.string :type
      t.string :project_id
      t.string :project_version_id
      t.text :prompt
      t.string :status
      t.text :ai_response

      t.timestamps
    end

    add_index :ai_tutor_interactions, :user_id
    add_index :ai_tutor_interactions, :level_id
    add_index :ai_tutor_interactions, :script_id
    add_index :ai_tutor_interactions, [:user_id, :level_id, :script_id], unique: false, name: "index_ati_user_level_script"
  end
end
