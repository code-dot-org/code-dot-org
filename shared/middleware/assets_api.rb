require 'cdo/aws/s3'
require 'cdo/rack/request'
require 'sinatra/base'

class AssetsApi < Sinatra::Base

  helpers do
    [
      'core.rb',
      'storage_id.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  @allowed_file_types = [
    'jpg',
    'jpeg',
    'gif',
    'png',
    'mp3'
  ]

  #
  # GET /v3/assets/<channel-id>
  #
  # List filenames and sizes.
  #
  get %r{/v3/assets/([^/]+)$} do |encrypted_channel_id|
    dont_cache
    content_type :json

    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}"
    s3 = Aws::S3::Client.new(region: 'us-east-1')
    s3.list_objects(bucket:CDO.assets_s3_bucket, prefix:prefix).contents.map do |fileinfo|
      filename = %r{#{prefix}/(.+)$}.match(fileinfo.key)[1]
      {filename:filename, size:fileinfo.size}
    end.to_json
  end

  #
  # GET /v3/assets/<channel-id>/<filename>
  #
  # Read a file.
  #
  get %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache
    not_found unless type = filename.split('.').last
    content_type type

    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    s3 = Aws::S3::Client.new(region: 'us-east-1')
    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"
    begin
      s3.get_object(bucket:CDO.assets_s3_bucket, key:key).body
    rescue Aws::S3::Errors::NoSuchKey
      not_found
    end
  end

  #
  # PUT /v3/assets/<channel-id>/<filename>
  #
  # Create a file.
  #
  put %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache
    file_type = filename.split('.').last
    unsupported_media_type unless file_type
    mime_type = request.content_type.to_s.split(';').first
    unsupported_media_type unless  mime_type == Sinatra::Base.mime_type(file_type)

    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    s3 = Aws::S3::Client.new(region: 'us-east-1')
    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"
    s3.put_object(bucket:CDO.assets_s3_bucket, key:key, body:request.body.read)
    no_content
  end

  #
  # DELETE /v3/assets/<channel-id>/<filename>
  #
  # Delete a file.
  #
  delete %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    s3 = Aws::S3::Client.new(region: 'us-east-1')
    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"

    begin
      s3.delete_object(bucket:CDO.assets_s3_bucket, key:key)
    rescue Aws::S3::Errors::NoSuchKey
      not_found
    end
    no_content
  end

end
