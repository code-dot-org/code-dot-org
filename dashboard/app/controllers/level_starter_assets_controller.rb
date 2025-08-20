class LevelStarterAssetsController < ApplicationController
  authorize_resource class: false, except: [:show, :file, :file_by_uuid]
  before_action :require_levelbuilder_mode, except: [:show, :file, :file_by_uuid]
  before_action :set_level
  skip_before_action :verify_authenticity_token, only: [:destroy]

  VALID_FILE_EXTENSIONS = %w(.jpg .jpeg .gif .png .mp3 .wav .pdf)

  MAX_FILE_SIZE_AI_CHAT = 5_000_000 # 5 MB
  MAX_DIMENSION_PIXELS_AI_CHAT = 2048

  # GET /level_starter_assets/:level_name
  def show
    starter_assets = (@level&.project_template_level&.starter_assets || @level.starter_assets || []).filter_map do |friendly_name, uuid_name|
      file_obj = LevelStarterAssetsHelper.get_object(uuid_name)
      LevelStarterAssetsHelper.summarize(file_obj, friendly_name, uuid_name)
    end

    render json: {starter_assets: starter_assets}
  end

  # GET /level_starter_assets/:level_name/:filename.:format
  # Returns requested file body as an IO stream.
  def file
    friendly_name = "#{params[:filename]}.#{params[:format]}"
    starter_assets = @level&.project_template_level&.starter_assets || @level&.starter_assets
    return head :not_found if starter_assets.nil_or_empty?

    uuid_name = starter_assets[friendly_name]
    get_file_and_send(uuid_name)
  end

  # GET /level_starter_assets/:level_name/:uuid.:format
  # Returns requested file body as an IO stream.
  # Client specifies the UUID of the file rather than the user-friendly name,
  # and the level's start_sources manages the mapping between friendly names
  # and UUIDs.
  def file_by_uuid
    uuid_name = "#{params[:uuid]}.#{params[:format]}"
    get_file_and_send(uuid_name)
  end

  # POST /level_starter_assets/:level_name
  def upload
    # upload_data sets an appropriate header and returns nil in error cases.
    upload_data = validate_upload
    return unless upload_data

    # Replace the friendly file name with a UUID for storage in S3 to avoid naming conflicts.
    uuid_name = SecureRandom.uuid + upload_data[:extension]

    upload_and_respond(uuid_name, upload_data)
  end

  # POST /level_starter_assets/:level_name/uuid/:uuid
  def upload_by_uuid
    # upload_data sets an appropriate header and returns nil in error cases.
    upload_data = validate_upload
    return unless upload_data

    uuid_name = params[:uuid] + upload_data[:extension]

    upload_and_respond(uuid_name, upload_data)
  end

  # DELETE /level_starter_assets/:level_name/:filename
  # *NOTE:* This deletes the image asset from the .level definition,
  # but does not delete the asset from S3 as other levels may still be
  # using it.
  def destroy
    if @level.remove_starter_asset!("#{params[:filename]}.#{params[:format]}")
      return head :no_content
    else
      return head :unprocessable_entity
    end
  end

  private def set_level
    @level = Level.cache_find(params[:level_name])
  end

  private def validate_upload
    # Client expects a single file upload, so raise an error if params[:files] contains more than one file.
    if params[:files].length > 1
      raise "One file upload expected. Actual: #{params[:files].length}"
    end

    upload = params[:files]&.first
    upload_tempfile = upload.tempfile
    friendly_name = upload.original_filename
    file_ext = File.extname(friendly_name)

    unless VALID_FILE_EXTENSIONS.include?(file_ext)
      head :unprocessable_entity
      return nil
    end

    # For AI Chat levels, we attempt to resize assets that are greater than 5 MB
    # to improve performance when used as input to OpenAI.
    if @level.is_a?(Aichat)
      if upload_tempfile.size > MAX_FILE_SIZE_AI_CHAT
        upload_tempfile = LevelStarterAssetsHelper.try_resize_file(upload.tempfile, file_ext, MAX_DIMENSION_PIXELS_AI_CHAT)
      end

      head :payload_too_large if upload_tempfile.size > MAX_FILE_SIZE_AI_CHAT
      return nil
    end

    {
      friendly_name: friendly_name,
      extension: file_ext,
      tempfile: upload_tempfile
    }
  end

  private def get_file_and_send(uuid_name)
    file_obj = LevelStarterAssetsHelper.get_object(uuid_name)
    content_type = LevelStarterAssetsHelper.file_content_type(File.extname(uuid_name))

    expires_in 1.hour, public: true
    send_data LevelStarterAssetsHelper.read_file(file_obj), type: content_type, disposition: 'inline'
  end

  private def upload_and_respond(uuid_name, upload_data)
    file_obj = LevelStarterAssetsHelper.get_object(uuid_name)
    success = file_obj&.upload_file(upload_data[:tempfile].path)

    if success && @level.add_starter_asset!(upload_data[:friendly_name], uuid_name)
      render json: LevelStarterAssetsHelper.summarize(file_obj, upload_data[:friendly_name], uuid_name)
    else
      return head :unprocessable_entity
    end
  end
end
