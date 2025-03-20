module LevelStarterAssetsHelper
  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze

  def self.summarize(file_obj, friendly_name, uuid_name)
    if file_obj.blank?
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

  def self.read_file(file_obj)
    file_obj.get.body.read
  end

  def self.get_object(s3_filename)
    path = prefix(s3_filename)
    bucket.object(path)
  end

  def self.file_mime_type(extension)
    type = MIME::Types.type_for(extension)&.first
    if type == MIME::Types['application/pdf']
      return 'pdf'
    end
    type&.raw_media_type
  end

  def self.file_content_type(extension)
    MIME::Types.type_for(extension)&.first&.content_type
  end

  def self.prefix(key)
    S3_PREFIX + key
  end

  def self.bucket
    Aws::S3::Bucket.new(S3_BUCKET)
  end
end
