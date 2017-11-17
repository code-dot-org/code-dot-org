class CreateCensusSubmissionFormMaps < ActiveRecord::Migration[5.0]
  def change
    create_table :census_submission_form_maps do |t|
      t.references :census_submission, foreign_key: true, null: false
      t.integer :form_id, null: false

      t.timestamps
    end

    add_index :census_submission_form_maps, [:form_id]
  end
end
