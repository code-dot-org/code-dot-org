#!/usr/bin/env ruby

# This script populates the storage_apps_id column of the channel_tokens table.

require_relative '../../../dashboard/config/environment'
require_relative '../../../shared/middleware/helpers/storage_id'

ChannelToken.find_each do |channel_token|
  _owner_id, channel_id = storage_decrypt_channel_id(channel_token.channel)
  channel_token.storage_app_id = channel_id
  channel_token.save!
end
