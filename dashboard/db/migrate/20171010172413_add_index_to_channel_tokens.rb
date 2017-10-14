class AddIndexToChannelTokens < ActiveRecord::Migration[5.0]
  def change
    add_index :channel_tokens, [:storage_id, :level_id], unique: true
  end
end
