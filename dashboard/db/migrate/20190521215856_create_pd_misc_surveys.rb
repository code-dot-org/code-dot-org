class CreatePdMiscSurveys < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_misc_surveys do |t|
      t.integer :form_id, limit: 8, index: true, null: false
      t.integer :submission_id, limit: 8, index: {unique: true}, null: false
      t.text :answers
      t.references :user

      t.timestamps
    end
  end
end
