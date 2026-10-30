class CreateAiInteractionFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :ai_interaction_feedbacks do |t|
      t.integer :user_id, null: false
      t.integer :level_id
      t.integer :script_id
      t.boolean :thumbs_up
      t.string :school_year
      t.json :metadata

      t.belongs_to :ai_interaction, polymorphic: true, null: false

      t.timestamps
    end
  end
end
