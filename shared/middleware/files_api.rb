require 'cdo/aws/s3'
require 'cdo/rack/request'
require 'sinatra/base'

class FilesApi < Sinatra::Base

  def get_bucket_impl(endpoint)
    case endpoint
    when 'assets'
      AssetBucket
    when 'sources'
      SourceBucket
    else
      not_found
    end
  end

  def allowed_file_type?(endpoint, extension)
    case endpoint
    when 'assets'
      # Only allow specific image and sound types to be uploaded by users.
      %w(.jpg .jpeg .gif .png .mp3).include? extension
    when 'sources'
      # Only allow JavaScript and Blockly XML source files.
      %w(.js .xml .txt .json).include? extension
    else
      not_found
    end
  end

  helpers do
    %w(core.rb bucket_helper.rb asset_bucket.rb source_bucket.rb storage_id.rb).each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  #
  # GET /v3/(assets|sources)/<channel-id>
  #
  # List filenames and sizes.
  #
  get %r{/v3/(assets|sources)/([^/]+)$} do |endpoint, encrypted_channel_id|
    dont_cache
    content_type :json

    get_bucket_impl(endpoint).new.list(encrypted_channel_id).to_json
  end

  #
  # GET /v3/(assets|sources)/<channel-id>/<filename>?version=<version-id>
  #
  # Read a file. Optionally get a specific version instead of the most recent.
  #
  get %r{/v3/(assets|sources)/([^/]+)/([^/]+)$} do |endpoint, encrypted_channel_id, filename|
    dont_cache
    type = File.extname(filename)
    not_found if type.empty?
    content_type type

    get_bucket_impl(endpoint).new.get(encrypted_channel_id, filename, request.GET['version']) || not_found
  end

  #
  # PUT /v3/(assets|sources)/<dest-channel-id>?src=<src-channel-id>
  #
  # Copy all files from one channel to another. Return metadata of copied files.
  #
  put %r{/v3/(assets|sources)/([^/]+)$} do |endpoint, encrypted_dest_channel_id|
    dont_cache

    encrypted_src_channel_id = request.GET['src']
    bad_request if encrypted_src_channel_id.empty?
    get_bucket_impl(endpoint).new.copy_assets(encrypted_src_channel_id, encrypted_dest_channel_id).to_json
  end

  #
  # PUT /v3/(assets|sources)/<channel-id>/<filename>?version=<version-id>
  #
  # Create or replace a file. Optionally overwrite a specific version.
  #
  put %r{/v3/(assets|sources)/([^/]+)/([^/]+)$} do |endpoint, encrypted_channel_id, filename|
    dont_cache

    # read the entire request before considering rejecting it, otherwise varnish
    # may return a 503 instead of whatever status code we specify.
    body = request.body.read
    # verify that file type is in our whitelist, and that the user-specified
    # mime type matches what Sinatra expects for that file type.
    file_type = File.extname(filename)
    unsupported_media_type unless allowed_file_type?(endpoint, file_type)
    # ignore client-specified mime type. infer it from file extension
    # when serving assets.
    mime_type = Sinatra::Base.mime_type(file_type)

    response = get_bucket_impl(endpoint).new.create_or_replace(encrypted_channel_id, filename, body, request.GET['version'])

    content_type :json
    category = mime_type.split('/').first
    {filename: filename, category: category, size: body.length, versionId: response.version_id}.to_json
  end

  #
  # DELETE /v3/(assets|sources)/<channel-id>/<filename>
  #
  # Delete a file.
  #
  delete %r{/v3/(assets|sources)/([^/]+)/([^/]+)$} do |endpoint, encrypted_channel_id, filename|
    dont_cache
    get_bucket_impl(endpoint).new.delete(encrypted_channel_id, filename)
    no_content
  end

  #
  # GET /v3/sources/<channel-id>/<filename>/versions
  #
  # List versions of the given file.
  # NOTE: Not yet implemented for assets.
  #
  get %r{/v3/sources/([^/]+)/([^/]+)/versions$} do |encrypted_channel_id, filename|
    dont_cache
    content_type :json

    SourceBucket.new.list_versions(encrypted_channel_id, filename).to_json
  end

end
