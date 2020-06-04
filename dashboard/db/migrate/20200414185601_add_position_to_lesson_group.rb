class AddPositionToLessonGroup < ActiveRecord::Migration[5.0]
  def change
    add_column :lesson_groups, :position, :integer
  end
end
