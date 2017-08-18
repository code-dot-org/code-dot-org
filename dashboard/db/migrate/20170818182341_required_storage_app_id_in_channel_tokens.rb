class RequiredStorageAppIdInChannelTokens < ActiveRecord::Migration[5.0]
  def change
    change_column_null :channel_tokens, :storage_app_id, false
  end
end
