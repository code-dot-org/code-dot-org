class AddUniqueIndexToLessonsResources < ActiveRecord::Migration[5.2]
  def up
    remove_index :lessons_resources, [:lesson_id, :resource_id]
    add_index :lessons_resources, [:lesson_id, :resource_id], unique: true
  end

  def down
  end
end
