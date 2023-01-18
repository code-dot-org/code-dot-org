require 'mini_magick'

#
# AssetBucket
#
class AssetBucket < BucketHelper
  # Don't attempt to resize images larger than 20 MB
  def max_resize_size
    20_000_000 # 20 MB
  end

  def initialize
    super CDO.assets_s3_bucket, CDO.assets_s3_directory
  end

  def allowed_file_types
    # Only allow specific image and sound types to be uploaded by users.
    %w(.jpg .jpeg .gif .png .mp3 .wav .pdf .doc .docx)
  end

  def try_resize_file(body, extension)
    # Resizing takes a lot of compute power. If we're given an image higher than 20MB, don't attempt
    # to resize. (The upper limit we want to use may actually be much higher, but I was unable to
    # find an image larger than 20MB to test with). Here, we resize the height and width to 1/4 of
    # their original value because it's very quick from a compute perspective (<1s versus ~6s for
    # 1/2). And because the resolution is still pretty good on the small visualization area used
    # in our web apps.
    if ([".jpg", ".jpeg", ".png"].include? extension.downcase) && (body.length < max_resize_size)
      image = MiniMagick::Image.read(body, extension)
      image.resize (image.height / 4).floor.to_s + "x" + (image.width / 4).floor.to_s
      return image.to_blob
    end
    return body
  end

  def cache_duration_seconds
    3600
  end

  def copy_level_starter_assets(src_channel, dest_channel)
    src_owner_id, src_storage_app_id = storage_decrypt_channel_id(src_channel)

    channel = ChannelToken.find_by(storage_id: src_owner_id, storage_app_id: src_storage_app_id)
    return unless channel

    # For a template-backed level, the level associated with the channel
    # is the template level, not the "derived" level.
    level = Level.cache_find(channel.level_id)
    return unless level&.starter_assets

    dest_owner_id, dest_storage_app_id = storage_decrypt_channel_id(dest_channel)

    # As noted above, when copying from a template-backed level,
    # the level associated with the channel is the template level (rather than the "derived" level).
    # Therefore, we always copy the level's starter assets (rather than having to look up a template level's assets).
    level.starter_assets.map do |friendly_name, uuid_name|
      src = "#{@bucket}/#{LevelStarterAssetsController::S3_PREFIX}#{uuid_name}"
      dest = s3_path dest_owner_id, dest_storage_app_id, friendly_name
      s3.copy_object(bucket: @bucket, key: dest, copy_source: ERB::Util.url_encode(src), metadata_directive: 'REPLACE')
    end
  end
end
