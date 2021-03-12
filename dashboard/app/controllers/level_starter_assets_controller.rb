class LevelStarterAssetsController < ApplicationController
  authorize_resource class: false, except: [:show, :file]
  before_action :require_levelbuilder_mode, except: [:show, :file]
  before_action :set_level
  skip_before_action :verify_authenticity_token, only: [:destroy]

  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze
  VALID_FILE_EXTENSIONS = %w(.jpg .jpeg .gif .png .mp3)

  # GET /level_starter_assets/:level_name
  def show
    starter_assets = (@level.starter_assets || []).map do |friendly_name, uuid_name|
      file_obj = get_object(uuid_name)
      summarize(file_obj, friendly_name, uuid_name)
    end.compact

    render json: {starter_assets: starter_assets}
  end

  # GET /level_starter_assets/:level_name/:filename
  # Returns requested file body as an IO stream.
  def file
    friendly_name = "#{params[:filename]}.#{params[:format]}"
    uuid_name = @level.starter_assets[friendly_name]
    file_obj = get_object(uuid_name)
    content_type = file_content_type(File.extname(uuid_name))

    expires_in 1.hour, public: true
    send_data read_file(file_obj), type: content_type, disposition: 'inline'
  end

  # POST /level_starter_assets/:level_name
  def upload
    # Client expects a single file upload, so raise an error if params[:files] contains more than one file.
    if params[:files].length > 1
      raise "One file upload expected. Actual: #{params[:files].length}"
    end

    upload = params[:files]&.first
    friendly_name = upload.original_filename
    file_ext = File.extname(friendly_name)

    unless VALID_FILE_EXTENSIONS.include?(file_ext)
      return head :unprocessable_entity
    end

    # Replace the friendly file name with a UUID for storage in S3 to avoid naming conflicts.
    uuid_name = SecureRandom.uuid + file_ext
    file_obj = get_object(uuid_name)
    success = file_obj&.upload_file(upload.tempfile.path)

    if success && @level.add_starter_asset!(friendly_name, uuid_name)
      render json: summarize(file_obj, friendly_name, uuid_name)
    else
      return head :unprocessable_entity
    end
  end

  # DELETE /level_starter_assets/:level_name/:filename
  # *NOTE:* This deletes the image asset from the .level definition,
  # but does not delete the asset from S3 as other levels may still be
  # using it.
  def destroy
    if @level.remove_starter_asset!(params[:filename])
      return head :no_content
    else
      return head :unprocessable_entity
    end
  end

  #
  # HELPERS
  #

  def summarize(file_obj, friendly_name, uuid_name)
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

  def get_object(s3_filename)
    path = prefix(s3_filename)
    bucket.object(path)
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
