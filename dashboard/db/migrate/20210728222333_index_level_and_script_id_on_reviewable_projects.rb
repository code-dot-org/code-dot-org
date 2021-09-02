class IndexLevelAndScriptIdOnReviewableProjects < ActiveRecord::Migration[5.2]
  def change
    remove_index :reviewable_projects, column: [:storage_app_id, :user_id]
    add_index :reviewable_projects,
      [:user_id, :script_id, :level_id, :storage_app_id],
      name: 'index_reviewable_projects_on_user_script_level_storage_app'
  end
end
