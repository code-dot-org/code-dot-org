require 'cdo/project_source_json'

MAIN_JSON_FILENAME = 'main.json'.freeze

#
# SourceBucket
#
class SourceBucket < BucketHelper
  def initialize
    super CDO.sources_s3_bucket, CDO.sources_s3_directory
  end

  def allowed_file_types
    # Only allow JavaScript and Blockly XML source files.
    %w(.js .xml .txt .json)
  end

  def cache_duration_seconds
    0
  end

  # Copies the given version of the file to make it the current revision.
  # (All intermediate versions are preserved.)
  # Copies the animations at the given version and makes them the current version.
  def restore_previous_version(encrypted_channel_id, filename, version_id, user_id)
    # In most cases fall back on the generic restore behavior.
    return super(encrypted_channel_id, filename, version_id, user_id) unless MAIN_JSON_FILENAME == filename

    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

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

  private

  def library_animation?(animation_props)
    source_url = animation_props['sourceUrl']
    source_url && source_url =~ /^#{'/api/v1/animation-library'}/
  end
end
