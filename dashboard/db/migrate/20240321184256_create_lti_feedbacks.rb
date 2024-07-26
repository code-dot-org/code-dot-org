class CreateLtiFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :lti_feedbacks do |t|
      t.belongs_to :user, type: :integer, null: false, foreign_key: true, index: {unique: true}

      t.boolean :satisfied, null: false, index: true
      t.string :locale
      t.boolean :early_access

      t.datetime :created_at, null: false
    end
  end
end
