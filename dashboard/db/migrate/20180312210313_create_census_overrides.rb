class CreateCensusOverrides < ActiveRecord::Migration[5.0]
  def change
    create_table :census_overrides do |t|
      t.string :school_id, limit: 12, null: false
      t.integer :school_year, limit: 2, null: false
      t.string :teaches_cs, limit: 2, null: false

      t.timestamps
    end

    add_foreign_key :census_overrides, :schools
  end
end
