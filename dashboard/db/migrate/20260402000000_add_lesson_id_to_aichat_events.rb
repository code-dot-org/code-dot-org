class AddLessonIdToAichatEvents < ActiveRecord::Migration[6.1]
  def up
    add_column :aichat_events, :lesson_id, :integer unless column_exists?(:aichat_events, :lesson_id)

    unless index_exists?(:aichat_events, :lesson_id, name: "index_ace_lesson_id")
      add_index :aichat_events, :lesson_id,
                name: "index_ace_lesson_id",
                algorithm: :inplace
    end

    unless index_exists?(:aichat_events, [:lesson_id, :user_id], name: "index_ace_lesson_user")
      add_index :aichat_events, [:lesson_id, :user_id],
                name: "index_ace_lesson_user",
                algorithm: :inplace
    end
  end

  def down
    remove_index :aichat_events, name: "index_ace_lesson_user", if_exists: true
    remove_index :aichat_events, name: "index_ace_lesson_id", if_exists: true
    remove_column :aichat_events, :lesson_id, if_exists: true
  end
end
