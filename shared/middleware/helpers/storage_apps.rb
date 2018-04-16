require 'sinatra'
require_relative './storage_id'

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

  def create(value, ip:, type: nil, published_at: nil, remix_parent_id: nil)
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
    }
    row[:id] = @table.insert(row)

    storage_encrypt_channel_id(row[:storage_id], row[:id])
  end

  def delete(channel_id)
    owner, id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id

    delete_count = @table.where(id: id).update(state: 'deleted')
    raise NotFound, "channel `#{channel_id}` not found" if delete_count == 0

    # TODO: Delete all storage associated with this channel (e.g. properties and tables and assets)

    true
  end

  def get(channel_id)
    owner, id = storage_decrypt_channel_id(channel_id)
    row = @table.where(id: id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    # For some apps, if it was created by a signed out user, we don't want anyone
    # else to be able to access it (for privacy reasons)
    anonymous_age_restricted_apps = ['applab', 'gamelab', 'weblab']
    if owner != @storage_id && !user_id_for_storage_id(owner)
      begin
        # row[:projectType] isn't set for channels associated with levels (vs. standalone
        # projects), so we crack open the JSON blob instead
        project_type = JSON.parse(row[:value])['projectType']
      rescue JSON::ParserError
        nil
      end
      raise NotFound, "channel `#{channel_id}` not shareable" if anonymous_age_restricted_apps.include? project_type
    end

    StorageApps.merged_row_value(row, channel_id: channel_id, is_owner: owner == @storage_id)
  end

  def update(channel_id, value, ip_address)
    owner, id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id

    row = {
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }
    update_count = @table.where(id: id).exclude(state: 'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    # We can't include :created_at here without an extra DB query. Most consumers won't need :created_at during updates, so omit it.
    JSON.parse(row[:value]).merge(id: channel_id, isOwner: owner == @storage_id, updatedAt: row[:updated_at])
  end

  def publish(channel_id, type, user)
    owner, id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id
    row = {
      project_type: type,
      published_at: DateTime.now,
    }
    update_count = @table.where(id: id).exclude(state: 'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    project = @table.where(id: id).first
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
    owner, id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id
    row = {
      published_at: nil,
    }
    update_count = @table.where(id: id).exclude(state: 'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0
  end

  def get_abuse(channel_id)
    _owner, id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id: id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    row[:abuse_score]
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
    _owner, id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id: id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    new_score = row[:abuse_score] + (JSON.parse(row[:value])['frozen'] ? 0 : amount)

    update_count = @table.where(id: id).exclude(state: 'deleted').update({abuse_score: new_score})
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    new_score
  end

  def reset_abuse(channel_id)
    _owner, id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id: id).exclude(state: 'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    update_count = @table.where(id: id).exclude(state: 'deleted').update({abuse_score: 0})
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    0
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
      begin
        parsed = JSON.parse(i[:value])
        !parsed['hidden'] && !parsed['frozen'] && parsed['level'].split('/').last == key
      rescue
        # Malformed channel, or missing level.
      end
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
end
