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

  @@allowed_file_types = [
    'jpg',
    'jpeg',
    'gif',
    'png',
    'mp3'
  ]

  def self.connect_s3
    params = {region: 'us-east-1'}
    if CDO.s3_access_key_id && CDO.s3_secret_access_key
      params[:credentials] = Aws::Credentials.new(CDO.s3_access_key_id, CDO.s3_secret_access_key)
    end
    Aws::S3::Client.new(params)
  end

  def self.s3
    @@s3 ||= self.connect_s3
  end

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
    self.class.s3.list_objects(bucket:CDO.assets_s3_bucket, prefix:prefix).contents.map do |fileinfo|
      filename = %r{#{prefix}/(.+)$}.match(fileinfo.key)[1]
      mime_type = Sinatra::Base.mime_type(filename.split('.').last)
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'
      {filename:filename, category:category, size:fileinfo.size}
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
    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"
    begin
      self.class.s3.get_object(bucket:CDO.assets_s3_bucket, key:key).body
    rescue Aws::S3::Errors::NoSuchKey
      not_found
    end
  end

  #
  # PUT /v3/assets/<dest-channel-id>?src=<src-channel-id>
  #
  # Copy all files from one channel to another. Return metadata of copied files.
  #
  put %r{/v3/assets/([^/]+)$} do |encrypted_dest_channel_id|
    encrypted_src_channel_id = request.GET['src']
    self.class.copy_assets(encrypted_src_channel_id, encrypted_dest_channel_id).to_json
  end

  def self.copy_assets(src_channel, dest_channel)
    src_owner_id, src_channel_id = storage_decrypt_channel_id(src_channel)
    dest_owner_id, dest_channel_id = storage_decrypt_channel_id(dest_channel)

    src_prefix = "#{CDO.assets_s3_directory}/#{src_owner_id}/#{src_channel_id}/"
    self.s3.list_objects(bucket:CDO.assets_s3_bucket, prefix:src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}/(.+)$}.match(fileinfo.key)[1]
      mime_type = Sinatra::Base.mime_type(filename.split('.').last)
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'

      src = "#{CDO.assets_s3_bucket}/#{src_prefix}#{filename}"
      dest = "#{CDO.assets_s3_directory}/#{dest_owner_id}/#{dest_channel_id}/#{filename}"
      self.s3.copy_object(bucket:CDO.assets_s3_bucket, key:dest, copy_source:src)

      {filename:filename, category:category, size:fileinfo.size}
    end
  end

  #
  # PUT /v3/assets/<channel-id>/<filename>
  #
  # Create a file.
  #
  put %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache

    # read the entire request before considering rejecting it, otherwise varnish
    # may return a 503 instead of whatever status code we specify.
    body = request.body.read
    # verify that file type is in our whitelist, and that the user-specified
    # mime type matches what Sinatra expects for that file type.
    file_type = filename.split('.').last
    unsupported_media_type unless @@allowed_file_types.include?(file_type)
    # ignore client-specified mime type. infer it from file extension
    # when serving assets.
    mime_type = Sinatra::Base.mime_type(file_type)

    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"
    self.class.s3.put_object(bucket:CDO.assets_s3_bucket, key:key, body:body)
    content_type :json
    category = mime_type.split('/').first
    {filename:filename, category:category, size:body.length}.to_json
  end

  #
  # DELETE /v3/assets/<channel-id>/<filename>
  #
  # Delete a file.
  #
  delete %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"

    self.class.s3.delete_object(bucket:CDO.assets_s3_bucket, key:key)
    no_content
  end

end
