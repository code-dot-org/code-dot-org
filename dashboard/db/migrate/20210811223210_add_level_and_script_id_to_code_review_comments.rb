class AddLevelAndScriptIdToCodeReviewComments < ActiveRecord::Migration[5.2]
  def change
    add_column :code_review_comments, :script_id, :integer, after: :project_version
    add_column :code_review_comments, :level_id, :integer, after: :script_id
  end
end
