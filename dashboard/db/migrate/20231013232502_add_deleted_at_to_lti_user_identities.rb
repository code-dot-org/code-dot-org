class AddDeletedAtToLtiUserIdentities < ActiveRecord::Migration[6.1]
  def change
    add_column :lti_user_identities, :deleted_at, :datetime
    add_index :lti_user_identities, :deleted_at
  end
end
