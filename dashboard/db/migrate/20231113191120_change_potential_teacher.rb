class ChangePotentialTeacher < ActiveRecord::Migration[6.1]
  def change
    change_column_null :potential_teachers, :name, false
    change_column_null :potential_teachers, :email, false
    rename_column :potential_teachers, :source_course_offering_id, :script_id
    add_index :potential_teachers, :script_id
  end
end
