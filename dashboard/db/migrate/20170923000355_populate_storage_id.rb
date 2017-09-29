class PopulateStorageId < ActiveRecord::Migration[5.0]
  def change
    # We don't want to run as part of our deploy if the table is large (i.e. prod)
    # Prod will instead do this using the very similar oneoff script
    # bin/oneoff/backfill_data/channel_tokens_storage_id
    return if Rails.env.production?

    slice = 0

    ChannelToken.find_in_batches(batch_size: 500) do |channel_tokens_batch|
      ActiveRecord::Base.transaction do
        channel_tokens_batch.each do |channel_token|
          next unless channel_token.storage_id.nil?
          storage_id, _storage_app_id = storage_decrypt_channel_id(channel_token.channel)
          channel_token.storage_id = storage_id
          save_result = channel_token.save(touch: false)
          raise "ERROR: ID #{channel_token.id}. STORAGE_ID: #{storage_id}." unless save_result
        end
      end

      slice += 1
    end
  end
end
