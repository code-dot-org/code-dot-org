class CreateApSchoolCodes < ActiveRecord::Migration[5.0]
  def change
    create_table :ap_school_codes, id: false, primary_key: :school_code do |t|
      t.string :school_code, limit: 6, null: false
      t.string :school_id, limit: 12, null: false

      t.timestamps
    end

    add_foreign_key :ap_school_codes, :schools
    add_index :ap_school_codes, :school_code, unique: true
    add_index :ap_school_codes, :school_id, unique: true
  end
end
