class CreateIbSchoolCodes < ActiveRecord::Migration[5.0]
  def change
    create_table :ib_school_codes, id: false, primary_key: :school_code do |t|
      t.string :school_code, limit: 6, null: false
      t.string :school_id, limit: 12, null: false

      t.timestamps
    end

    add_index :ib_school_codes, :school_code, unique: true
    add_index :ib_school_codes, :school_id, unique: true
    add_foreign_key :ib_school_codes, :schools
  end
end
