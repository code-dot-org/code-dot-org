class AddLessonIdToAichatEvents < ActiveRecord::Migration[6.1]
  def change
    add_column :aichat_events, :lesson_id, :integer
    add_index :aichat_events, [:user_id, :lesson_id]
  end
end
