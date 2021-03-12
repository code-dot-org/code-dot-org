# == Schema Information
#
# Table name: channel_tokens
#
#  id             :integer          not null, primary key
#  storage_app_id :integer          not null
#  level_id       :integer          not null
#  created_at     :datetime
#  updated_at     :datetime
#  storage_id     :integer          not null
#
# Indexes
#
#  index_channel_tokens_on_storage_app_id           (storage_app_id)
#  index_channel_tokens_on_storage_id               (storage_id)
#  index_channel_tokens_on_storage_id_and_level_id  (storage_id,level_id) UNIQUE
#

class ChannelToken < ApplicationRecord
  belongs_to :user
  belongs_to :level

  def channel
    storage_encrypt_channel_id(storage_id, storage_app_id)
  end

  # @param [Level] level The level associated with the channel token request.
  # @param [String] ip The IP address making the channel token request.
  # @param [String] user_storage_id The if of the storage app associated with the channel token request.
  # @param [Hash] data
  # @return [ChannelToken] The channel token (new or existing).
  def self.find_or_create_channel_token(level, ip, user_storage_id, data = {})
    storage_app = StorageApps.new(user_storage_id)
    # If `create` fails because it was beat by a competing request, a second
    # `find_by` should succeed.
    # Read from primary to minimize write conflicts.
    SeamlessDatabasePool.use_master_connection do
      Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        # your own channel
        find_or_create_by!(level: level.host_level, storage_id: user_storage_id) do |ct|
          # Get a new channel_id.
          channel = create_channel ip, storage_app, data: data, standalone: false
          _, ct.storage_app_id = storage_decrypt_channel_id(channel)
        end
      end
    end
  end

  def self.find_channel_token(level, user_storage_id)
    find_by(level: level.host_level, storage_id: user_storage_id)
  end

  # Create a new channel.
  # @param [Hash] data Data to store in the channel.
  # @param [String] src Optional source channel to copy data from, instead of
  #   using the value from the `data` param.
  def self.create_channel(ip, storage_app, data: {}, src: nil, type: nil, remix_parent_id: nil, standalone: true)
    if src
      data = storage_app.get(src)
      data['name'] = "Remix: #{data['name']}"
      data['hidden'] = false
      data['frozen'] = false
    end

    timestamp = Time.now
    storage_app.create(
      data.merge('createdAt' => timestamp, 'updatedAt' => timestamp),
      ip: ip,
      type: type,
      remix_parent_id: remix_parent_id,
      standalone: standalone,
    )
  end
end
