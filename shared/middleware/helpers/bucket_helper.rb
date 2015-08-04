#
# BucketHelper
#
class BucketHelper

  def initialize(bucket, base_dir)
    @bucket = bucket
    @base_dir = base_dir

    params = {region: 'us-east-1'}
    if CDO.s3_access_key_id && CDO.s3_secret_access_key
      params[:credentials] = Aws::Credentials.new(CDO.s3_access_key_id, CDO.s3_secret_access_key)
    end
    @s3 = Aws::S3::Client.new(params)
  end

  def list(encrypted_channel_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, channel_id
    @s3.list_objects(bucket: @bucket, prefix: prefix).contents.map do |fileinfo|
      filename = %r{#{prefix}(.+)$}.match(fileinfo.key)[1]
      mime_type = Sinatra::Base.mime_type(File.extname(filename))
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'
      {filename: filename, category: category, size: fileinfo.size}
    end
  end

  def get(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename
    begin
      @s3.get_object(bucket: @bucket, key: key).body
    rescue Aws::S3::Errors::NoSuchKey
      nil
    end
  end

  def copy_assets(src_channel, dest_channel)
    src_owner_id, src_channel_id = storage_decrypt_channel_id(src_channel)
    dest_owner_id, dest_channel_id = storage_decrypt_channel_id(dest_channel)

    src_prefix = s3_path src_owner_id, src_channel_id
    @s3.list_objects(bucket: @bucket, prefix: src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}(.+)$}.match(fileinfo.key)[1]
      mime_type = Sinatra::Base.mime_type(File.extname(filename))
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'

      src = "#{@bucket}/#{src_prefix}#{filename}"
      dest = s3_path dest_owner_id, dest_channel_id, filename
      @s3.copy_object(bucket: @bucket, key: dest, copy_source: src)

      {filename: filename, category: category, size: fileinfo.size}
    end
  end

  def create_or_replace(encrypted_channel_id, filename, body)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, channel_id, filename
    @s3.put_object(bucket: @bucket, key: key, body: body)
  end

  def delete(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    @s3.delete_object(bucket: @bucket, key: key)
  end

  def list_versions(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    @s3.list_object_versions(bucket: @bucket, prefix: key).versions.map do |version|
      [version.version_id, version.last_modified]
    end
  end

  protected

  def s3_path(owner_id, channel_id, filename = nil)
    "#{@base_dir}/#{owner_id}/#{channel_id}/#{filename}"
  end
end
