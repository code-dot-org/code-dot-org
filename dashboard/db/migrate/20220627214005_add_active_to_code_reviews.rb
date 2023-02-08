class AddActiveToCodeReviews < ActiveRecord::Migration[6.0]
  def change
    # Previously, the unique index was on the columns user_id, project_id, closed_at and deleted_at. There should
    # only be one open code review per user per project at any given time. The issue with the original
    # unique index is that in SQL NULL != NULL and since an open code review is represented by closed_at=NULL and
    # deleted_at=NULL this is considered different than another record with the same values. So the old unique index
    # was not properly guarding against duplicate open code review rows.
    #
    # The solution is to create inverse virtual columns for both nullable columns and include those in the unique
    # index instead. The new index will have user_id, project_id, open and active. When a code review is open
    # none of the columns in the unique index will be null (closed_at=NULL => open=true, deleted_at=null => active=true),
    # so it is guaranteed to be distinct from other open code reviews.

    # The active column is the inverse of deleted_at, it is null when deleted_at is populated
    add_column :code_reviews, :active, :boolean, as: "IF(`deleted_at` IS NULL, true, NULL)"
    # The open column is the inverse of closed_at, it is null when closed_at is populated
    add_column :code_reviews, :open, :boolean, as: "IF(`closed_at` IS NULL, true, NULL)"

    remove_index :code_reviews, name: 'index_code_reviews_unique'
    add_index :code_reviews, [:user_id, :project_id, :open, :active], name: 'index_code_reviews_unique', unique: true
  end
end
