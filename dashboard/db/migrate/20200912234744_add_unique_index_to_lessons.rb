class AddUniqueIndexToLessons < ActiveRecord::Migration[5.0]
  def change
    add_index :stages, [:lesson_group_id, :key], unique: true
  end
end
