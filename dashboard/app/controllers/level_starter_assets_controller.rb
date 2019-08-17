class LevelStarterAssetsController < ApplicationController
  before_action :set_level

  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze

  # GET /level_starter_assets/:level_name
  def show
    starter_assets = @level.starter_assets.map {|name, _| summarize(@level, name)}.compact

    render json: {starter_assets: starter_assets}
  end

  # GET /level_starter_assets/:level_name/:filename
  # Returns requested file body as an IO stream.
  def file
    friendly_name = "#{params[:filename]}.#{params[:format]}"
    guid_name = @level.starter_assets[friendly_name]
    file_obj = get_object(prefix(guid_name))
    content_type = file_content_type(File.extname(guid_name))
    send_data read_file(file_obj), type: content_type, disposition: 'inline'
  end

  # POST /level_starter_assets/:level_name
  def upload
    return head :forbidden unless current_user&.levelbuilder? && Rails.application.config.levelbuilder_mode

    # Client expects a single file upload, so raise an error if params[:files] contains more than one file.
    if params[:files].length > 1
      raise "One file upload expected. Actual: #{params[:files].length}"
    end

    upload = params[:files]&.first
    friendly_name = upload.original_filename
    # Replace the friendly file name with a UUID for storage in S3 to avoid naming conflicts.
    uuid_name = SecureRandom.uuid + File.extname(friendly_name)
    file_obj = get_object(prefix(uuid_name))
    success = file_obj&.upload_file(upload.tempfile.path)

    if success && @level.add_starter_asset(friendly_name, uuid_name)
      render json: summarize(@level, friendly_name)
    else
      return head :unprocessable_entity
    end
  end

  #
  # HELPERS
  #

  def summarize(level, friendly_name)
    uuid_name = level.starter_assets[friendly_name]
    file_obj = get_object(prefix(uuid_name))
    if file_obj.nil? || file_obj.size.zero?
      nil
    else
      {
        filename: friendly_name,
        category: file_mime_type(File.extname(uuid_name)),
        size: file_obj.size,
        timestamp: file_obj.last_modified
      }
    end
  end

  def read_file(file_obj)
    file_obj.get.body.read
  end

  def get_object(path)
    file_obj = bucket.object(path)
    # S3 won't throw an error if file_obj isn't found *until* you try to access
    # the object. Calling .size allows us to make sure the object is present
    # before returning it or logging an error to HB.
    file_obj.size
    file_obj
  rescue Aws::S3::Errors::NotFound => e
    Honeybadger.notify(
      error_class: e,
      error_message: "Unable to find starter asset with path #{path} for level '#{@level.name}'"
    )
    nil
  end

  private

  def set_level
    @level = Level.cache_find(params[:level_name])
  end

  def file_mime_type(extension)
    MIME::Types.type_for(extension)&.first&.raw_media_type
  end

  def file_content_type(extension)
    MIME::Types.type_for(extension)&.first&.content_type
  end

  def prefix(key)
    S3_PREFIX + key
  end

  def bucket
    Aws::S3::Bucket.new(S3_BUCKET)
  end
end
