class CreateCourseScripts < ActiveRecord::Migration[5.0]
  def change
    create_table :course_scripts do |course_script|
      course_script.belongs_to :course, {null: false}
      course_script.belongs_to :script, {null: false}
      course_script.integer :position, {null: false}
    end
  end
end
