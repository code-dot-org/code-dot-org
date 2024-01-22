class RemoveStateSchoolIdColumn < ActiveRecord::Migration[6.1]
  def change
    remove_column :schools, :state_school_id, if_exists: true
  end
end
