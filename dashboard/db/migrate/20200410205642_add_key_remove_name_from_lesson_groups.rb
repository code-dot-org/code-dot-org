class AddKeyRemoveNameFromLessonGroups < ActiveRecord::Migration[5.0]
  def change
    rename_column :lesson_groups, :name, :key
    change_column_null :lesson_groups, :key, false
  end
end
