class DropCoursesTable < ActiveRecord::Migration[5.0]
  def up
    # As a final check, add foreign key constraints against the new table before
    # dropping the old table. In environments such as production and
    # levelbuilder where many sections are assigned to courses like csp and csd,
    # this step will fail if the new table is empty or has different ids than
    # the old table.
    add_foreign_key :sections, :unit_groups, column: :course_id
    add_foreign_key :plc_courses, :unit_groups, column: :course_id

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
