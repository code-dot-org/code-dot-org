class AddIndexesToAichatEvents < ActiveRecord::Migration[6.1]
  def up
    unless index_exists?(
      :aichat_events, [:user_id, :level_id, :script_id,  :id],
                name: "index_ace_user_level_script_id"
              )
      add_index :aichat_events, [:user_id, :level_id, :script_id, :id],
                name: "index_ace_user_level_script_id",
                algorithm: :inplace
    end

    unless index_exists?(
      :aichat_events, [:user_id, :project_id, :id],
                name: "index_ace_user_project_id"
              )
      add_index :aichat_events, [:user_id, :project_id, :id],
                name: "index_ace_user_project_id",
                algorithm: :inplace
    end
  end

  def down
    remove_index :aichat_events, name: "index_ace_user_level_script_id", if_exists: true
    remove_index :aichat_events, name: "index_ace_user_project_id", if_exists: true
  end
end
