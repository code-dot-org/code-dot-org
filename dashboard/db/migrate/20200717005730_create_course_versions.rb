class CreateCourseVersions < ActiveRecord::Migration[5.0]
  def change
    create_table :course_versions do |t|
      t.string :version_name
      t.text :properties

      t.timestamps
    end
  end
end
