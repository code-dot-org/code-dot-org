class AddStorageAppToChannelTokens < ActiveRecord::Migration[5.0]
  def change
    add_column :channel_tokens, :storage_app_id, :integer, after: :channel
    add_index :channel_tokens, :storage_app_id
  end
end
