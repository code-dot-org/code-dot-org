module LevelStarterAssetsHelper
  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze
  MAX_RESIZE_SIZE = 20_000_000 # 20 MB

  def self.try_resize_file(file, extension, max_dimension_px)
    # Resizing takes a lot of compute power.
    # If we're given an image higher than 20MB, don't attempt to resize.
    # Since this is intended to be a levelbuilder-specific helper (ie, low volume/levelbuilder machine), it may be safe to increase this limit.
    if ([".jpg", ".jpeg", ".png"].include? extension.downcase) && (file.length < MAX_RESIZE_SIZE)
      image = MiniMagick::Image.read(file, extension)

      # The '>' suffix means that the image will be resized to fit within the given dimensions,
      # but smaller images will not be enlarged.
      image.resize max_dimension_px.to_s + 'x' + max_dimension_px.to_s + '>'
      return image.tempfile
    end

    file
  end

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
