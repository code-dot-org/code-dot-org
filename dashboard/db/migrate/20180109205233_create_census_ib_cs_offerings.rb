class CreateCensusIbCsOfferings < ActiveRecord::Migration[5.0]
  def change
    create_table :ib_cs_offerings do |t|
      t.string :school_code, limit: 6, null: false
      t.string :level, limit: 2, null: false
      # limit on integers is number of bytes, not digits or display length
      t.integer :school_year, limit: 2, null: false

      t.timestamps
    end

    add_index :ib_cs_offerings, [:school_code, :school_year, :level], unique: true
  end
end
