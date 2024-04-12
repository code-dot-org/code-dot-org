class CreateNewFeatureFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :new_feature_feedbacks do |t|
      t.belongs_to :user, type: :integer, null: false, foreign_key: true, index: {unique: true}

      t.string :form_key, null: false
      t.boolean :satisfied, null: false, index: true
      t.string :locale

      t.datetime :created_at, null: false
    end
  end
end
