class ChangeStateSchoolId < ActiveRecord::Migration[5.0]
  def up
    remove_foreign_key :state_cs_offerings, column: :state_school_id
    change_column :schools, :state_school_id, :string, null: true
    change_column :state_cs_offerings, :state_school_id, :string, null: false
    add_foreign_key :state_cs_offerings, :schools, column: :state_school_id, primary_key: :state_school_id
  end

  def down
    remove_foreign_key :state_cs_offerings, column: :state_school_id
    change_column :schools, :state_school_id, :string, limit: 11, null: true
    change_column :state_cs_offerings, :state_school_id, :string, limit: 11, null: false
    add_foreign_key :state_cs_offerings, :schools, column: :state_school_id, primary_key: :state_school_id
  end
end
