class ChangeIndexToScriptAndKeyForLessonGroups < ActiveRecord::Migration[5.0]
  def change
    remove_index :lesson_groups, :script_id
    add_index :lesson_groups, [:script_id, :key], unique: true
  end
end
