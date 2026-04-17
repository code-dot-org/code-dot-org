require 'marcel'

# Security guard for ImageMagick processing.
module ImageMagickGuard
  # Raster formats that are safe to process with ImageMagick.
  SAFE_TYPES = %w[image/png image/jpeg image/gif image/webp].freeze

  # Returns the MIME type inferred from magic bytes via Marcel, or nil if
  # unrecognized. Marcel returns "application/octet-stream" for unknown content;
  # we normalize that to nil so callers can use a simple nil check.
  def self.actual_content_type(bytes)
    type = Marcel::MimeType.for(bytes.b)
    type == 'application/octet-stream' ? nil : type
  end

  # Returns true iff the bytes represent a format safe to process with ImageMagick.
  def self.safe_for_imagemagick?(bytes)
    SAFE_TYPES.include?(actual_content_type(bytes))
  end

  # Patches MiniMagick::Image.read to validate magic bytes before processing.
  # Called once from the Rails initializer; safe to call multiple times (idempotent).
  def self.patch_mini_magick!
    return if MiniMagick::Image.singleton_class.ancestors.include?(ReadPatch)
    MiniMagick::Image.singleton_class.prepend(ReadPatch)
  end

  # Prepended onto MiniMagick::Image's singleton class by patch_mini_magick!.
  module ReadPatch
    def read(data, ext = nil)
      # Normalize to String so we can inspect bytes and pass un-exhausted
      # data to super even when the caller hands us an IO object.
      bytes = data.is_a?(String) ? data : data.read
      actual = ImageMagickGuard.actual_content_type(bytes)
      unless ImageMagickGuard::SAFE_TYPES.include?(actual)
        raise MiniMagick::Invalid, "image content does not match a recognized safe image format (magic bytes check failed)"
      end
      if ext
        expected = Marcel::MimeType.for(extension: ext.downcase)
        # Marcel returns "application/octet-stream" for unknown extensions;
        # only enforce agreement when the extension maps to a known safe type.
        if ImageMagickGuard::SAFE_TYPES.include?(expected) && expected != actual
          raise MiniMagick::Invalid, "image content (#{actual}) does not match file extension #{ext} (expected #{expected})"
        end
      end
      super(bytes, ext)
    end
  end
end
