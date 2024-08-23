require 'cdo/project_source_json'

# Check whether it is defined, since helpers can be double-included.
MAIN_JSON_FILENAME = 'main.json'.freeze unless defined? MAIN_JSON_FILENAME

#
# SourceBucket
# Assumes only main.json files will be uploaded to this bucket.
#
class SourceBucket < BucketHelper
  
  
  
  def initialize
    super
  end

  def allowed_file_name?(filename)
    filename == MAIN_JSON_FILENAME
  end

  def allowed_file_types
    %w(.json)
  end

  def cache_duration_seconds
    0
  end

  def self.main_json_filename
    MAIN_JSON_FILENAME
  end

  # Copies the given version of the file to make it the current revision.
  # (All intermediate versions are preserved.)
  # Copies the animations at the given version and makes them the current version.
  def restore_previous_version(encrypted_channel_id, filename, version_id, user_id)
    # In most cases fall back on the generic restore behavior.
    return super(encrypted_channel_id, filename, version_id, user_id) unless filename == MAIN_JSON_FILENAME

    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    source_object = s3.get_object(bucket: @bucket, key: key, version_id: version_id)
    source_body = source_object.body.read

    psj = ProjectSourceJson.new(source_body)

    if psj.animation_manifest?
      # Make copies of each animation at the specified version
      # Update the manifest to reference the copied animations
      anim_bucket = AnimationBucket.new
      psj.each_animation do |a|
        next if library_animation? a
        anim_response = anim_bucket.restore_previous_version(
          encrypted_channel_id,
          "#{a['key']}.png",
          a['version'],
          user_id
        )
        psj.set_animation_version(a['key'], anim_response[:version_id])
      end
    end

    if psj.in_restricted_share_mode?
      project = Project.find_by_channel_id(encrypted_channel_id)
      unless project.published_at.nil?
        Projects.new(owner_id).unpublish(encrypted_channel_id)
      end
    end

    # Write the updated main.json file back to S3 as the latest version
    response = s3.put_object(bucket: @bucket, key: key, body: psj.to_json)

    # If we get this far, the restore request has succeeded.
    log_restored_file(
      project_id: encrypted_channel_id,
      user_id: user_id,
      filename: filename,
      source_version_id: version_id,
      new_version_id: response.version_id
    )

    response.to_h
  end

  # Copies the main.json in the src_channel to the dest_channel
  # Update the animation manifest to include the version ids of the animations
  # in dest_channel
  # Note: this function assumes that the animations have already been copied
  def remix_source(src_channel, dest_channel, animation_list)
    src_owner_id, src_storage_app_id = storage_decrypt_channel_id(src_channel)
    dest_owner_id, dest_storage_app_id = storage_decrypt_channel_id(dest_channel)

    src = s3_path src_owner_id, src_storage_app_id, MAIN_JSON_FILENAME
    dest = s3_path dest_owner_id, dest_storage_app_id, MAIN_JSON_FILENAME

    # Get animation manifest
    src_object = s3.get_object(bucket: @bucket, key: src)
    src_body = src_object.body.read

    # Only update version ids for main.json files
    unless animation_list.empty?
      src_body = ProjectSourceJson.new(src_body)

      if src_body.animation_manifest?
        # Update the manifest to reference the newest version of the animations
        # in the destination channel
        src_body.each_animation do |a|
          next if library_animation? a
          anim_response = animation_list.find do |item|
            item[:filename] == "#{a['key']}.png"
          end
          src_body.set_animation_version(a['key'], anim_response[:versionId]) unless anim_response.nil? || anim_response.empty?
        end
      end

      src_body = src_body.to_json
    end
    # Write the updated main.json file back to S3 as the latest version
    s3.put_object(bucket: @bucket, key: dest, body: src_body)
  rescue Aws::S3::Errors::NoSuchKey
    # No main.json, nothing to copy
  end

  # Special app_size implementation for Sources bucket that assumes the only file in this
  # bucket will be called main.json.
  # This avoids a potentially expensive LIST request to S3.
  def app_size(encrypted_channel_id)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, MAIN_JSON_FILENAME
    s3.head_object(bucket: @bucket, key: key).content_length.to_i
  rescue Aws::S3::Errors::NotFound
    0
  end

  private def library_animation?(animation_props)
    source_url = animation_props['sourceUrl']
    source_url && source_url =~ /^#{'/api/v1/animation-library'}/
  end
end
