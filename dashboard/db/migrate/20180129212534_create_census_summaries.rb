class CreateCensusSummaries < ActiveRecord::Migration[5.0]
  def change
    create_table :census_summaries do |t|
      t.string :school_id, limit: 12, null: false
      # limit on integers is number of bytes, not digits or display length
      t.integer :school_year, limit: 2, null: false
      t.string :teaches_cs, limit: 1, null: false
      t.text :audit_data, null: false

      t.timestamps
    end

    add_index :census_summaries, [:school_id, :school_year], unique: true
    add_foreign_key :census_summaries, :schools
  end
end
