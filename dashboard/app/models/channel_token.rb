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
#  script_id      :integer
#  deleted_at     :datetime
#
# Indexes
#
#  index_channel_tokens_on_storage_app_id  (storage_app_id)
#  index_channel_tokens_on_storage_id      (storage_id)
#  index_channel_tokens_unique             (storage_id,level_id,script_id,deleted_at) UNIQUE
#

class ChannelToken < ApplicationRecord
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :user, optional: true
  belongs_to :level, optional: true
  belongs_to :script, class_name: 'Unit', optional: true

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id

  def channel
    storage_encrypt_channel_id(storage_id, project_id)
  end

  # @param [Level] level The level associated with the channel token request.
  # @param [String] ip The IP address making the channel token request.
  # @param [String] user_storage_id The ID of the project associated with the channel token request.
  # @param [Integer] script_id The ID of the script associated with the channel token.
  # @param [Hash] data
  # @return [ChannelToken] The channel token (new or existing).
  def self.find_or_create_channel_token(level, ip, user_storage_id, script_id = nil, data = {})
    project = Projects.new(user_storage_id)
    # If `create` fails because it was beat by a competing request, a second
    # `find_by` should succeed.
    # Read from primary to minimize write conflicts.
    ActiveRecord::Base.connected_to(role: :writing) do
      Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        # your own channel
        channel_token = find_channel_token(level, user_storage_id, script_id)

        return channel_token if channel_token

        # script_id was recently added to the channel_token table. While the backfills and code changes are
        # in progress (https://codedotorg.atlassian.net/browse/LP-1395), script_id will be written to the table
        # but not used in the query for a channel_token yet.
        create!(level: level.host_level, storage_id: user_storage_id, script_id: script_id) do |ct|
          # Get a new channel_id.
          channel = create_channel ip, project, data: data, standalone: false, level: level
          _, ct.project_id = storage_decrypt_channel_id(channel)
        end
      end
    end
  end

  # Finds the channel token. If a channel token exists for the user and level with and without a script ID,
  # the channel token with the script_id takes precedence.
  #
  # Background: The Channel Tokens table did not always have a script_id column. Originally, a channel token for a level
  # was identified by the level_id. Since we use the same level in different scripts, we needed to include
  # script_id to identify the correct channel token for a level (https://codedotorg.atlassian.net/browse/LP-1395). As part of
  # this work, we had to backfill the channel tokens table with the proper script_id. For some channel tokens it was not
  # possible to identify which script they were associated with. For these channel tokens the script_id was left empty, which
  # is why we need to query for a channel token with script_id and fallback on one without script_id.
  #
  # @param [Level] level The level associated with the channel token request.
  # @param [String] user_storage_id The ID of the project associated with the channel token request.
  # @param [Integer] script_id The ID of the script associated with the channel token.
  def self.find_channel_token(level, user_storage_id, script_id)
    order(script_id: 'desc').find_by(level: level.host_level, storage_id: user_storage_id, script_id: [nil, script_id])
  end

  # Create a new channel.
  # @param [Hash] data Data to store in the channel.
  # @param [String] src Optional source channel to copy data from, instead of
  #   using the value from the `data` param.
  def self.create_channel(ip, project, data: {}, src: nil, type: nil, remix_parent_id: nil, standalone: true, level: nil)
    if src
      data = project.get(src)
      data.merge!(name: "Remix: #{data['name']}", hidden: false, frozen: false)
    end

    timestamp = Time.now
    project.create(
      data.merge(createdAt: timestamp, updatedAt: timestamp),
      ip: ip,
      type: type,
      remix_parent_id: remix_parent_id,
      standalone: standalone,
      level: level,
    )
  end
end
