class DropCoursesTable < ActiveRecord::Migration[5.0]
  def change
    # As a final check, add foreign key constraints against the new table before
    # dropping the old table. In environments such as production and
    # levelbuilder where many sections are assigned to courses like csp and csd,
    # this step will fail if the new table is empty or has different ids than
    # the old table.
    add_foreign_key :sections, :unit_groups, column: :course_id
    add_foreign_key :plc_courses, :unit_groups, column: :course_id

    drop_table :courses
  end
end
