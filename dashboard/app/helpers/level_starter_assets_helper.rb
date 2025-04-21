module LevelStarterAssetsHelper
  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze
  MAX_RESIZE_SIZE = 20_000_000 # 20 MB

  def self.try_resize_file(body, extension)
    # Resizing takes a lot of compute power. If we're given an image higher than 20MB, don't attempt
    # to resize. (The upper limit we want to use may actually be much higher, but I was unable to
    # find an image larger than 20MB to test with). Here, we resize the height and width to 1/4 of
    # their original value because it's very quick from a compute perspective (<1s versus ~6s for
    # 1/2). And because the resolution is still pretty good on the small visualization area used
    # in our web apps.
    if ([".jpg", ".jpeg", ".png"].include? extension.downcase) && (body.length < MAX_RESIZE_SIZE)
      image = MiniMagick::Image.read(body, extension)
      # puts (image.height / 4).floor.to_s + "x" + (image.width / 4).floor.to_s
      # image.resize (image.height / 4).floor.to_s + "x" + (image.width / 4).floor.to_s
      image.resize (image.width / 4).floor.to_s + "x" + (image.height / 4).floor.to_s
      return image.to_blob
    end
    return body
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
