class AddIndexToAichatEventsUserProject < ActiveRecord::Migration[6.1]
  def change
    add_index :aichat_events, [:user_id, :project_id], unique: false, name: 'index_ace_user_project'
  end
end
