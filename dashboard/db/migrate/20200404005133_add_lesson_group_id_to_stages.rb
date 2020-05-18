class AddLessonGroupIdToStages < ActiveRecord::Migration[5.0]
  def change
    add_column :stages, :lesson_group_id, :integer
  end
end
