class CreateNewFeatureFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :new_feature_feedbacks do |t|
      t.belongs_to :user, type: :integer, null: false, foreign_key: true

      t.integer :form_key, null: false
      t.boolean :satisfied, null: false, index: true

      t.index [:user_id, :form_key], unique: true

      t.timestamps
    end
  end
end
