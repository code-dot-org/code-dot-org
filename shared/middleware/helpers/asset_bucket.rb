#
# AssetBucket
#
class AssetBucket < BucketHelper
  def initialize
    super CDO.assets_s3_bucket, CDO.assets_s3_directory
  end

  def allowed_file_types
    # Only allow specific image and sound types to be uploaded by users.
    %w(.jpg .jpeg .gif .png .mp3 .pdf .doc .docx)
  end

  def cache_duration_seconds
    3600
  end

  def hard_delete_channel_content(encrypted_channel_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    # Find all objects in bucket
    channel_prefix = s3_path owner_id, channel_id
    object_list = s3.list_objects(bucket: @bucket, prefix: channel_prefix)
    return 0 if object_list.contents.empty?

    # Delete all objects
    objects_to_delete = object_list.contents.map {|v| v.to_h.slice(:key)}
    result = s3.delete_objects(
      bucket: @bucket,
      delete: {
        objects: objects_to_delete,
        quiet: true
      }
    )
    raise <<~ERROR unless result.errors.empty?
      Error deleting channel content:
      #{result.errors.map(&:to_s).join("\n      ")}
    ERROR
    result.deleted.count
  end
end
