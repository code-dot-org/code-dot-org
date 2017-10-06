class ChangeChannelTokensNullable < ActiveRecord::Migration[5.0]
  def change
    change_column_null :channel_tokens, :storage_id, false
    change_column_null :channel_tokens, :channel, true
    change_column_null :channel_tokens, :user_id, true
  end
end
