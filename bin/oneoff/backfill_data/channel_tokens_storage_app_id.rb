#!/usr/bin/env ruby

# This script populates the storage_apps_id column of the channel_tokens table.

require_relative '../../../dashboard/config/environment'
require_relative '../../../shared/middleware/helpers/storage_id'

slice = 0

ChannelToken.find_in_batches(batch_size: 500) do |channel_tokens_batch|
  puts "PROCESSING: slice #{slice}..."
  ActiveRecord::Base.transaction do
    channel_tokens_batch.each do |channel_token|
      _owner_id, channel_id = storage_decrypt_channel_id(channel_token.channel)
      channel_token.storage_app_id = channel_id
      channel_token.save!
    end
  end
  puts "PROCESSED: slice #{slice}..."

  slice += 1
end
