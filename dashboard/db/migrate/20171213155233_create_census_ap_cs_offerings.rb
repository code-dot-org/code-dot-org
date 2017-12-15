class CreateCensusApCsOfferings < ActiveRecord::Migration[5.0]
  def change
    create_table :ap_cs_offerings do |t|
      t.string :school_code, limit: 6, null: false
      t.string :course, limit: 3, null: false
      # limit on integers is number of bytes, not digits or display length
      t.integer :school_year, limit: 2, null: false

      t.timestamps
    end

    add_index :ap_cs_offerings, [:school_code, :school_year, :course], unique: true
  end
end
