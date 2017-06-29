# == Schema Information
#
# Table name: channel_tokens
#
#  id             :integer          not null, primary key
#  channel        :string(255)      not null
#  storage_app_id :integer
#  user_id        :integer          not null
#  level_id       :integer          not null
#  created_at     :datetime
#  updated_at     :datetime
#
# Indexes
#
#  index_channel_tokens_on_storage_app_id        (storage_app_id)
#  index_channel_tokens_on_user_id_and_level_id  (user_id,level_id) UNIQUE
#

class ChannelToken < ActiveRecord::Base
  belongs_to :user
  belongs_to :level

  def self.find_or_create_channel_token(level, user, ip, storage_app, data = {})
    # If `create` fails because it was beat by a competing request, a second
    # `find_by` should succeed.
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      # your own channel
      find_or_create_by!(level: level.host_level, user: user) do |ct|
        # Get a new channel_id.
        ct.channel = create_channel ip, storage_app, data: data
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
  def self.create_channel(ip, storage_app, data: {}, src: nil, use_firebase: false, type: nil)
    if src
      data = storage_app.get(src)
      data['name'] = "Remix: #{data['name']}"
      data['hidden'] = false
      data['frozen'] = false
    end

    if use_firebase
      data['useFirebase'] = true
    end

    timestamp = Time.now
    storage_app.create(data.merge('createdAt' => timestamp, 'updatedAt' => timestamp), ip: ip, type: type)
  end
end
