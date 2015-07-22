require 'cdo/aws/s3'
require 'cdo/rack/request'
require 'sinatra/base'

class AssetsApi < Sinatra::Base

  helpers do
    %w(core.rb assets.rb storage_id.rb).each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  ALLOWED_FILE_TYPES = %w(jpg jpeg gif png mp3)

  #
  # GET /v3/assets/<channel-id>
  #
  # List filenames and sizes.
  #
  get %r{/v3/assets/([^/]+)$} do |encrypted_channel_id|
    dont_cache
    content_type :json

    AssetBucket.new.list(encrypted_channel_id).to_json
  end

  #
  # GET /v3/assets/<channel-id>/<filename>
  #
  # Read a file.
  #
  get %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache
    not_found unless (type = filename.split('.').last)
    content_type type

    AssetBucket.new.get(encrypted_channel_id, filename) || not_found
  end

  #
  # PUT /v3/assets/<dest-channel-id>?src=<src-channel-id>
  #
  # Copy all files from one channel to another. Return metadata of copied files.
  #
  put %r{/v3/assets/([^/]+)$} do |encrypted_dest_channel_id|
    dont_cache

    encrypted_src_channel_id = request.GET['src']
    AssetBucket.new.copy_assets(encrypted_src_channel_id, encrypted_dest_channel_id).to_json
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
    unsupported_media_type unless ALLOWED_FILE_TYPES.include?(file_type)
    # ignore client-specified mime type. infer it from file extension
    # when serving assets.
    mime_type = Sinatra::Base.mime_type(file_type)

    AssetBucket.new.create(encrypted_channel_id, filename, body)

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
    AssetBucket.new.delete(encrypted_channel_id, filename)
    no_content
  end

end
