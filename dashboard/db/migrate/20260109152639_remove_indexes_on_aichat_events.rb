class RemoveIndexesOnAichatEvents < ActiveRecord::Migration[6.1]
  def change
    remove_index :aichat_events, name: "index_ace_user_project", if_exists: true
    remove_index :aichat_events, name: "index_ace_user_level_script", if_exists: true
  end
end
