class DropCourseUnitForeignKeys < ActiveRecord::Migration
  def up
    remove_foreign_key_if_exists :plc_course_units, :plc_course_id
    remove_foreign_key_if_exists :plc_enrollment_unit_assignments, :plc_user_course_enrollment_id
    remove_foreign_key_if_exists :plc_enrollment_unit_assignments, :plc_course_unit_id
  end

  def down
    
  end

  private
  def remove_foreign_key_if_exists(table, key)
    remove_foreign_key table, column: key if foreign_keys(table).find_index {|x| x.column == key.to_s} != nil
  end
end
