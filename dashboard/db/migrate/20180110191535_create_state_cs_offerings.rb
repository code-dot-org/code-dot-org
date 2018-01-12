class CreateStateCsOfferings < ActiveRecord::Migration[5.0]
  def change
    create_table :state_cs_offerings do |t|
      t.string :state_school_id, limit: 11, null: false
      t.string :course, null: false
      # limit on integers is number of bytes, not digits or display length
      t.integer :school_year, limit: 2, null: false

      t.timestamps
    end

    add_index :state_cs_offerings, [:state_school_id, :school_year, :course], unique: true, name: 'index_state_cs_offerings_on_id_and_year_and_course'
    add_foreign_key :state_cs_offerings, :schools, column: :state_school_id, primary_key: :state_school_id
  end
end
