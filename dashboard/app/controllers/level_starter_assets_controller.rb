class LevelStarterAssetsController < ApplicationController
  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze

  # GET /level_starter_assets/:id
  def show
    level_channel_id = params[:id]
    starter_assets = get_file_objects(level_channel_id).map do |file_obj|
      file_obj.size.zero? ? nil : summarize(level_channel_id, file_obj)
    end.compact

    render json: {starter_assets: starter_assets}
  end

  # GET /level_starter_assets/:id/:filename
  # Returns requested file body as an IO stream.
  def file
    # TODO: THIS BREAKS WHEN FILENAME HAS SPACES
    path = prefix("#{params[:id]}/#{params[:filename]}.#{params[:format]}")
    file_obj = get_object(path)
    filename = filename(params[:id], file_obj)
    content_type = file_content_type(File.extname(filename))
    send_data read_file(file_obj), type: content_type, disposition: 'inline'
  end

  # POST /level_starter_assets/:id
  def upload
    return head :forbidden unless current_user&.levelbuilder? && Rails.application.config.levelbuilder_mode

    # Client expects a single file upload, so raise an error if params[:files] contains more than one file.
    if params[:files].length > 1
      raise "One file upload expected. Actual: #{params[:files].length}"
    end

    upload = params[:files]&.first
    prefix = prefix("#{params[:id]}/#{upload.original_filename}")
    file_obj = get_object(prefix)
    success = file_obj.upload_file(upload.tempfile.path)

    if success
      render json: summarize(params[:id], file_obj)
    else
      return head :unprocessable_entity
    end
  end

  #
  # HELPERS
  #

  def summarize(level_channel_id, file_obj)
    filename = filename(level_channel_id, file_obj)
    {
      filename: filename,
      category: file_mime_type(File.extname(filename)),
      size: file_obj.size,
      timestamp: file_obj.last_modified
    }
  end

  def read_file(file_obj)
    file_obj.get.body.read
  end

  def get_object(path)
    bucket.object(path)
  end

  def get_file_objects(key)
    bucket.objects(prefix: prefix(key))
  end

  private

  def filename(key, file_obj)
    prefix = prefix("#{key}/")
    file_obj.key.sub(prefix, '')
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
