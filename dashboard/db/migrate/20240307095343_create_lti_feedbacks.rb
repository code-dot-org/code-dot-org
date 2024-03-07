class CreateLtiFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :lti_feedbacks do |t|
      t.belongs_to :user, null: false, index: {unique: true}

      t.integer :satisfaction_level, null: false, index: true
      t.string :locale
      t.boolean :early_access

      t.datetime :created_at, null: false
    end
  end
end
