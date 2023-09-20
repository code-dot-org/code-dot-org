class RemoveStateSchoolIdUniqueConstraint < ActiveRecord::Migration[6.1]
  def change
    remove_index :schools, column: :state_school_id, unique: true
    add_index :schools, :state_school_id
  end
end
