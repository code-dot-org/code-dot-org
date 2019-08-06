class LevelStarterAssetsController < ApplicationController
  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze

  # GET /level_starter_assets/:id
  def show
    level_channel_id = params[:id]
    starter_assets = get_file_objects(level_channel_id).map do |file_obj|
      if file_obj.size.zero?
        nil
      else
        filename = filename(level_channel_id, file_obj)
        {
          filename: filename,
          category: file_mime_type(File.extname(filename)),
          size: file_obj.size,
          timestamp: file_obj.last_modified
        }
      end
    end.compact

    render json: {starter_assets: starter_assets}
  end

  private

  def filename(id, file_obj)
    file_obj.key.sub(prefix(id) + '/', '')
  end

  def file_mime_type(extension)
    MIME::Types.type_for(extension)&.first&.raw_media_type
  end

  def prefix(id)
    S3_PREFIX + id
  end

  # Returns S3_BUCKET objects in the S3_PREFIX/id directory.
  def get_file_objects(id)
    bucket.objects(prefix: prefix(id))
  end

  def bucket
    Aws::S3::Bucket.new(S3_BUCKET)
  end
end
