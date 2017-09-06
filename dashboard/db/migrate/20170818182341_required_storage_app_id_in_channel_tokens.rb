class RequiredStorageAppIdInChannelTokens < ActiveRecord::Migration[5.0]
  def change
    change_column_null :channel_tokens, :storage_app_id, false
  rescue
    puts 'To populate the storage_app_id token (so that the column can be non-nullable), run: '
    puts '  chmod 744 bin/oneoff/backfill_data/channel_tokens_storage_app_id'
    puts '  ./bin/oneoff/backfill_data/channel_tokens_storage_app_id'
    puts '  chmod 644 bin/oneoff/backfill_data/channel_tokens_storage_app_id'
  end
end
