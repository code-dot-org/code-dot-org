class DropCoursesTable < ActiveRecord::Migration[5.0]
  def up
    # Do not add back foreign key constraints against the new table, because
    # this step timed out when run against an adhoc with a production db clone,
    # and the foreign keys aren't strictly necessary anyway.

    drop_table :courses
  end

  def down
    # create courses as an exact copy of the unit_groups table
    execute 'CREATE TABLE courses LIKE unit_groups'
    execute 'INSERT INTO courses SELECT * FROM unit_groups'

    # fix the name of the index
    remove_index :courses, :name
    add_index :courses, :name

    remove_foreign_key_if_exists :sections, :course_id
    remove_foreign_key_if_exists :plc_courses, :course_id
  end

  private

  def remove_foreign_key_if_exists(table, key)
    remove_foreign_key table, column: key unless foreign_keys(table).find_index {|x| x.column == key.to_s}.nil?
  end
end
