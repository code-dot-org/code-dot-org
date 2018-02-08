class RemoveUserAndChannelFromChannelTokens < ActiveRecord::Migration[5.0]
  def change
    remove_index :channel_tokens, [:user_id, :level_id]
    remove_column :channel_tokens, :user_id, :integer
    remove_column :channel_tokens, :channel, :string
  end
end
