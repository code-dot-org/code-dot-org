class UpdateCodeReviewCommentsToUseStorageAppId < ActiveRecord::Migration[5.2]
  def change
    add_column :code_review_comments, :storage_app_id, :integer, null: false, after: :id
    add_index :code_review_comments, [:storage_app_id, :project_version],
      name: 'index_code_review_comments_on_storage_app_id_and_version'

    remove_index :code_review_comments,
      name: 'index_code_review_comments_on_project_id_and_version',
      column: [:channel_token_id, :project_version]
    remove_column :code_review_comments, :channel_token_id, :integer
  end
end
