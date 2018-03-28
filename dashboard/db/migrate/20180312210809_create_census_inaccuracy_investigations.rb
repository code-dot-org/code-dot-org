class CreateCensusInaccuracyInvestigations < ActiveRecord::Migration[5.0]
  def change
    create_table :census_inaccuracy_investigations do |t|
      t.integer :user_id, null: false
      t.text :notes, null: false
      t.integer :census_submission_id, null: false
      t.integer :census_override_id

      t.timestamps
    end

    add_foreign_key :census_inaccuracy_investigations, :users
    add_foreign_key :census_inaccuracy_investigations, :census_submissions
    add_foreign_key :census_inaccuracy_investigations, :census_overrides
  end
end
