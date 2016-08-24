class FixDropCourseUnitForeignKeys < ActiveRecord::Migration[4.2]
  def change
    remove_foreign_key_if_exists :plc_learning_modules, :plc_course_unit_id
  end

  private

  def remove_foreign_key_if_exists(table, key)
    remove_foreign_key table, column: key unless foreign_keys(table).find_index {|x| x.column == key.to_s}.nil?
  end
end
