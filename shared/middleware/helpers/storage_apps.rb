require 'sinatra'
require_relative './storage_id'
require_relative './profanity_privacy_helper'

#
# StorageApps
#
class StorageApps
  class NotFound < Sinatra::NotFound
  end

  def initialize(storage_id)
    @storage_id = storage_id

    @table = PEGASUS_DB[:storage_apps]
  end

  def create(value, ip:, type: nil, published_at: nil, remix_parent_id: nil, standalone: true)
    timestamp = DateTime.now
    row = {
      storage_id: @storage_id,
      value: value.to_json,
      created_at: timestamp,
      updated_at: timestamp,
      updated_ip: ip,
      abuse_score: 0,
      project_type: type,
      published_at: published_at,
      remix_parent_id: remix_parent_id,
      skip_content_moderation: false,
      standalone: standalone,
    }
    row[:id] = @table.insert(row)

    storage_encrypt_channel_id(row[:storage_id], row[:id])
  end

  def delete(channel_id)
    owner, storage_app_id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id

    delete_count = @table.where(id: storage_app_id).update(state: 'deleted')
    raise NotFound, "channel `#{channel_id}` not found" if delete_count == 0

    # TODO: Delete all storage associated with this channel (e.g. properties and tables and assets)

    true
  end

  def get(channel_id)
    owner, storage_app_id = storage_decrypt_channel_id(channel_id)
    row = @table.where(id: storage_app_id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    # For some apps, if it was created by a signed out user, we don't want anyone
    # else to be able to access it (for privacy reasons)
    anonymous_age_restricted_apps = ['applab', 'gamelab', 'weblab']
    if owner != @storage_id && !user_id_for_storage_id(owner)
      begin
        # row[:project_type] isn't always set for channels associated with levels (vs. standalone
        # projects), so we crack open the JSON blob instead
        project_type = row[:project_type] || JSON.parse(row[:value])['projectType']
      rescue JSON::ParserError
        nil
      end
      raise NotFound, "channel `#{channel_id}` not shareable" if anonymous_age_restricted_apps.include? project_type
    end

    StorageApps.merged_row_value(row, channel_id: channel_id, is_owner: owner == @storage_id)
  end

  def update(channel_id, value, ip_address, project_type: nil, locale: 'en')
    owner, storage_app_id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id

    new_name = value['name']
    project = @table.where(id: storage_app_id).first
    old_name = JSON.parse(project[:value])['name']
    if new_name != old_name
      share_failure = title_profanity_privacy_violation(new_name, locale)

      raise ProfanityPrivacyError.new(share_failure.content) if share_failure
    end

    row = {
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }
    row[:project_type] = project_type if project_type
    update_count = @table.where(id: storage_app_id).exclude(state: 'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    # We can't include :created_at here without an extra DB query. Most consumers won't need :created_at during updates, so omit it.
    JSON.parse(row[:value]).merge(id: channel_id, isOwner: owner == @storage_id, updatedAt: row[:updated_at])
  end

  def publish(channel_id, type, user)
    owner, storage_app_id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id
    row = {
      project_type: type,
      published_at: DateTime.now,
    }
    update_count = @table.where(id: storage_app_id).exclude(state: 'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    project = @table.where(id: storage_app_id).first
    StorageApps.get_published_project_data(project, channel_id).merge(
      # For privacy reasons, include only the first initial of the student's name.
      studentName: user && UserHelpers.initial(user[:name]),
      studentAgeRange: user && UserHelpers.age_range_from_birthday(user[:birthday]),
    )
  end

  # extracts published project data from a project (aka storage_apps table row).
  def self.get_published_project_data(project, channel_id)
    project_value = JSON.parse(project[:value])
    {
      channel: channel_id,
      name: project_value['name'],
      thumbnailUrl: StorageApps.make_thumbnail_url_cacheable(project_value['thumbnailUrl']),
      # Note that we are using the new :project_type field rather than extracting
      # it from :value. :project_type might not be present in unpublished projects.
      type: project[:project_type],
      publishedAt: project[:published_at],
    }
  end

  # This method can be removed once thumbnails are being served with s3 version ids.
  def self.make_thumbnail_url_cacheable(url)
    url.sub('/v3/files/', '/v3/files-public/') if url
  end

  def unpublish(channel_id)
    owner, storage_app_id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id
    row = {
      published_at: nil,
    }
    update_count = @table.where(id: storage_app_id).exclude(state: 'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0
  end

  # Determine if the current user can view the project
  def get_sharing_disabled(channel_id, current_user_id)
    owner_storage_id, storage_app_id = storage_decrypt_channel_id(channel_id)
    owner_user_id = user_storage_ids_table.where(id: owner_storage_id).first[:user_id]

    # Sharing of a project is not disabled for the project owner
    # or the teachers of the project owner
    # or if the current user paired with the owner
    if current_user_id == owner_user_id
      return false
    elsif teaches_student?(owner_user_id, current_user_id)
      return false
    elsif get_user_sharing_disabled(owner_user_id)
      !users_paired_on_level?(storage_app_id, current_user_id, owner_user_id, owner_storage_id)
    else
      return false
    end
  # Default to sharing disabled if there is an error
  rescue ArgumentError, OpenSSL::Cipher::CipherError
    true
  end

  def users_paired_on_level?(storage_app_id, current_user_id, owner_user_id, owner_storage_id)
    channel_tokens_table = DASHBOARD_DB[:channel_tokens]
    level_id_row = channel_tokens_table.where(storage_app_id: storage_app_id, storage_id: owner_storage_id).first
    return false if level_id_row.nil?
    level_id = level_id_row[:level_id]

    user_levels_table = DASHBOARD_DB[:user_levels]
    owner_user_level_id = user_levels_table.select(:id).where(user_id: owner_user_id, level_id: level_id)
    current_user_level_id = user_levels_table.select(:id).where(user_id: current_user_id, level_id: level_id)

    paired_user_levels_table = DASHBOARD_DB[:paired_user_levels]
    paired_level_row = paired_user_levels_table.where(driver_user_level_id: owner_user_level_id, navigator_user_level_id: current_user_level_id).first
    return false if paired_level_row.nil?

    return true
  end

  def increment_abuse(channel_id, amount = 10)
    _owner, storage_app_id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id: storage_app_id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    new_score = row[:abuse_score] + (JSON.parse(row[:value])['frozen'] ? 0 : amount)

    update_count = @table.where(id: storage_app_id).exclude(state: 'deleted').update({abuse_score: new_score})
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    new_score
  end

  def reset_abuse(channel_id)
    _owner, storage_app_id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id: storage_app_id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    update_count = @table.where(id: storage_app_id).exclude(state: 'deleted').update({abuse_score: 0})
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    0
  end

  def buffer_abuse_score(channel_id)
    buffered_abuse_score = -50
    # Reset to 0 first so projects that are featured,
    # unfeatured, then re-featured don't have super low
    # abuse scores.
    reset_abuse(channel_id)
    increment_abuse(channel_id, buffered_abuse_score)
  end

  def content_moderation_disabled?(channel_id)
    _owner, storage_app_id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id: storage_app_id).exclude(state: 'deleted').first
    return false unless row

    row[:skip_content_moderation]
  end

  #
  # Disables or enables automated content moderation for this project by
  # altering the value for content_moderation_disabled.
  # @param [String] channel_id - an encrypted channel id
  # @param [Boolean] disable, whether the content moderation should be
  # skipped or not for this project.
  # @raise [NotFound] if the channel does not exist or already has the desired
  # value for content_moderation_disabled.
  #
  def set_content_moderation(channel_id, disable)
    _owner, storage_app_id = storage_decrypt_channel_id(channel_id)
    rows_changed = @table.
      where(id: storage_app_id).
      exclude(state: 'deleted').
      update({skip_content_moderation: disable})
    raise NotFound, "channel `#{channel_id}` not found" unless rows_changed > 0

    disable
  end

  def to_a
    @table.where(storage_id: @storage_id).exclude(state: 'deleted').map do |row|
      channel_id = storage_encrypt_channel_id(row[:storage_id], row[:id])
      begin
        StorageApps.merged_row_value(
          row,
          channel_id: channel_id,
          is_owner: row[:storage_id] == @storage_id
        )
      rescue JSON::ParserError
        nil
      end
    end.compact
  end

  # Find the encrypted channel token for most recent project of the given type.
  def most_recent(key)
    row = @table.where(storage_id: @storage_id).exclude(state: 'deleted').order(Sequel.desc(:updated_at)).find do |i|
      parsed = JSON.parse(i[:value])
      !parsed['hidden'] && !parsed['frozen'] && parsed['level'].split('/').last == key
    rescue
      # Malformed channel, or missing level.
    end

    storage_encrypt_channel_id(row[:storage_id], row[:id]) if row
  end

  # Returns the row value with 'id' and 'isOwner' merged from input params, and
  # 'createdAt', 'updatedAt', 'publishedAt' and 'projectType' merged from the
  # corresponding database row values.
  def self.merged_row_value(row, channel_id:, is_owner:)
    JSON.parse(row[:value]).merge(
      {
        id: channel_id,
        isOwner: is_owner,
        createdAt: row[:created_at],
        updatedAt: row[:updated_at],
        publishedAt: row[:published_at],
        projectType: row[:project_type],
      }
    )
  end

  #
  # Given an encrypted channel id, attempt to determine the channel's
  # project type.
  # This isn't always possible - we aren't consistent about storing project
  # type information with the channel.
  #
  # @param [String] channel_id - an encrypted channel id
  # @return [String] The discovered project type, or 'unknown' if the type
  #   can't be determiend with given information.
  # @raise [NotFound] if the channel does not exist or is not shareable.
  #
  def project_type_from_channel_id(channel_id)
    project_type_from_merged_row(get(channel_id))
  end

  #
  # Looks up the set of ancestors in the remix history for a particular project.
  # This can require several queries, so be careful exposing this in the UI
  # for external users - right now this is designed as a utility for internal
  # use only.
  #
  # Note: It should be possible to reduce the number of queries by joining the
  #   table against itself.  Worth investigating if we wanted to expose this
  #   to users.
  #
  # @param [String] channel_id the child project channel id where we start
  #   our search.
  # @param [Integer] depth (optional) how many ancestors to retrieve.  Default
  #   to just one - this could get expensive if a project has a very deep
  #   remix ancestry.
  # @return [Array<String>] list of channel IDs of ancestor projects in reverse
  #   chronological order, up to the provided limit.
  #
  def self.remix_ancestry(channel_id, depth: 1)
    [].tap do |ancestors|
      _, storage_app_id = storage_decrypt_channel_id(channel_id)
      next_row = PEGASUS_DB[:storage_apps].where(id: storage_app_id).first
      while next_row&.[](:remix_parent_id)
        next_row = PEGASUS_DB[:storage_apps].where(id: next_row[:remix_parent_id]).first
        ancestors.push storage_encrypt_channel_id(next_row[:storage_id], next_row[:id]) if next_row
        break if ancestors.size >= depth
      end
    end
  rescue
    []
  end

  def self.get_abuse(channel_id)
    _, storage_app_id = storage_decrypt_channel_id(channel_id)
    project_info = PEGASUS_DB[:storage_apps].where(id: storage_app_id).first
    project_info[:abuse_score]
  end

  private

  #
  # Discovering a channel's project type is a real mess.  We don't usually
  # need to do this because the project type is usually part of the URL,
  # but for a few APIs this is needed.
  #
  # @param [Hash] row - A storage_apps merged row value as returned by
  #   `merged_row_value` or `get`.
  # @returns [String] The discovered project type, or 'unknown' if the type
  #   can't be determined with given information.
  #
  def project_type_from_merged_row(row)
    # We can derive channel project type from a few places.
    #
    # 1. The `project_type` column in the storage_apps table.
    #    This is often NULL for "hidden" levels, which includes project-backed
    #    script levels.
    return row[:projectType] if row[:projectType]

    # 2. The projectType property in the `value` JSON column.
    #    Apparently this is sometimes filled out _instead_ of the column.
    return row['projectType'] if row['projectType']

    # 3. The level property in the `value` JSON column.
    #    These are consistently values like "/projects/gamelab" or
    #    "/projects/calc" and can be used to reconstruct a project type if
    #    the `project_type` column doesn't have it.
    level = row['level']
    match_data = /^#{'/projects/'}([^\/]+)$/.match(level)
    return match_data[1] if match_data

    # Some number of projects don't contain a project type in any of these
    # places.  We suspect a number of them are pixelation widget projects.
    # Others have no content on S3, and may be just-created stub projects.
    # Report these as 'unknown'.
    'unknown'
  end
end
