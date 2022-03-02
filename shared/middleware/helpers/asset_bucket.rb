#
# AssetBucket
#
class AssetBucket < BucketHelper
  def initialize
    super CDO.assets_s3_bucket, CDO.assets_s3_directory
  end

  def allowed_file_types
    # Only allow specific image and sound types to be uploaded by users.
    %w(.jpg .jpeg .gif .png .mp3 .wav .pdf .doc .docx)
  end

  def cache_duration_seconds
    3600
  end

  def copy_level_starter_assets(src_channel, dest_channel)
    src_owner_id, src_storage_app_id = storage_decrypt_channel_id(src_channel)

    channel = ChannelToken.find_by(storage_id: src_owner_id, storage_app_id: src_storage_app_id)
    return unless channel

    level = Level.cache_find(channel.level_id)
    return unless level

    dest_owner_id, dest_storage_app_id = storage_decrypt_channel_id(dest_channel)

    (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, uuid_name|
      src = "#{@bucket}/#{LevelStarterAssetsController::S3_PREFIX}#{uuid_name}"
      dest = s3_path dest_owner_id, dest_storage_app_id, friendly_name
      s3.copy_object(bucket: @bucket, key: dest, copy_source: URI.encode(src), metadata_directive: 'REPLACE')
    end
  end
end
