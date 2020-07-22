class DropCoursesTable < ActiveRecord::Migration[5.0]
  def change
    drop_table :courses
  end
end
