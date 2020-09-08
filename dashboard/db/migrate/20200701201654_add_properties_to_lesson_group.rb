class AddPropertiesToLessonGroup < ActiveRecord::Migration[5.0]
  def change
    add_column :lesson_groups, :properties, :text
  end
end
