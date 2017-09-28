# == Schema Information
#
# Table name: channel_tokens
#
#  id             :integer          not null, primary key
#  channel        :string(255)      not null
#  storage_app_id :integer          not null
#  user_id        :integer          not null
#  level_id       :integer          not null
#  created_at     :datetime
#  updated_at     :datetime
#  storage_id     :integer
#
# Indexes
#
#  index_channel_tokens_on_storage_app_id        (storage_app_id)
#  index_channel_tokens_on_storage_id            (storage_id)
#  index_channel_tokens_on_user_id_and_level_id  (user_id,level_id) UNIQUE
#

class ChannelToken < ActiveRecord::Base
  belongs_to :user
  belongs_to :level

  # @param [Level] level The level associated with the channel token request.
  # @param [User] user The user associated with the channel token request.
  # @param [String] ip The IP address making the channel token request.
  # @param [StorageApps] storage_app The storage app associated with the channel token request.
  # @param [Hash] data
  # @return [ChannelToken] The channel token (new or existing).
  def self.find_or_create_channel_token(level, user, ip, storage_app, data = {})
    # If `create` fails because it was beat by a competing request, a second
    # `find_by` should succeed.
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      # your own channel
      find_or_create_by!(level: level.host_level, user: user) do |ct|
        # Get a new channel_id.
        ct.channel = create_channel ip, storage_app, data: data
        ct.storage_id, ct.storage_app_id = storage_decrypt_channel_id(ct.channel)
      end
    end
  end

  def self.find_channel_token(level, user)
    find_by(level: level.host_level, user: user)
  end

  # Create a new channel.
  # @param [Hash] data Data to store in the channel.
  # @param [String] src Optional source channel to copy data from, instead of
  #   using the value from the `data` param.
  def self.create_channel(ip, storage_app, data: {}, src: nil, type: nil)
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
      type: type
    )
  end
end
