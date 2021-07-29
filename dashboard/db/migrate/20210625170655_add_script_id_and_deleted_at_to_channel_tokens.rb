class AddScriptIdAndDeletedAtToChannelTokens < ActiveRecord::Migration[5.2]
  def change
    # This change will be implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?

    add_column :channel_tokens, :script_id, :integer
    add_column :channel_tokens, :deleted_at, :datetime
    add_index :channel_tokens, [:storage_id, :level_id, :script_id, :deleted_at], unique: true, name: 'index_channel_tokens_unique' # the generated name was too long
    remove_index :channel_tokens, [:storage_id, :level_id]
  end
end
