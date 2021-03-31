class AddScriptIdToChannelTokens < ActiveRecord::Migration[5.2]
  def change
    add_column :channel_tokens, :script_id, :integer
    remove_index :channel_tokens, [:storage_id, :level_id]
    add_index :channel_tokens, [:storage_id, :level_id, :script_id], unique: true
  end
end
