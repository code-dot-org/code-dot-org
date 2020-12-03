class CreateCourseVersions < ActiveRecord::Migration[5.0]
  def change
    create_table :course_versions do |t|
      t.string :key, null: false
      t.string :display_name, null: false
      t.text :properties
      t.references :content_root, polymorphic: true, null: false

      t.timestamps
    end
  end
end
