class AddStorageIdToChannelTokens < ActiveRecord::Migration[5.0]
  def change
    add_column :channel_tokens, :storage_id, :integer
    add_index :channel_tokens, :storage_id
  end
end
