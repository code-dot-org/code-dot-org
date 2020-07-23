class CreateUnitGroups < ActiveRecord::Migration[5.0]
  def up
    # create unit_groups as an exact copy of the courses table
    execute 'CREATE TABLE unit_groups LIKE courses'
    execute 'INSERT INTO unit_groups SELECT * FROM courses'

    # fix the name of the index
    remove_index :unit_groups, :name
    add_index :unit_groups, :name

    # Foreign key constraints on the old table must be removed in order for
    # unit tests to pass after our application code switches to point to the new
    # table in the next PR.
    remove_foreign_key_if_exists :sections, :course_id
    remove_foreign_key_if_exists :plc_courses, :course_id
  end

  def down
    drop_table :unit_groups
  end

  private

  def remove_foreign_key_if_exists(table, key)
    remove_foreign_key table, column: key unless foreign_keys(table).find_index {|x| x.column == key.to_s}.nil?
  end
end
