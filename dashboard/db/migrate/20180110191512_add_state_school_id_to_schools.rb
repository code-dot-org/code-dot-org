class AddStateSchoolIdToSchools < ActiveRecord::Migration[5.0]
  def change
    add_column :schools, :state_school_id, :string, limit: 11, null: true
    add_index :schools, :state_school_id, unique: true
  end
end
