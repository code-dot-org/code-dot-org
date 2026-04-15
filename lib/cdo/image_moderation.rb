require 'cdo/azure_ai_content_safety'
require 'honeybadger/ruby'
require 'mini_magick'
require 'stringio'

module ImageModeration
  # Azure AI Content Safety requires both dimensions to be at least this many pixels.
  MIN_MODERATION_DIMENSION = 50

  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/gif, image/jpeg, image/png
  # @return [Hash, nil] categoriesAnalysis response from Azure, or nil on error
  def self.moderate_image(image_data, content_type)
    unless CDO.azure_ai_content_safety_key
      Honeybadger.notify("Azure AI Content Safety API key is missing", context: {endpoint: CDO.azure_ai_content_safety_endpoint})
      return nil
    end

    moderation_io, moderation_type = scale_image_for_moderation_if_needed(image_data, content_type)
    raise AzureAiContentSafety::UnsupportedContentType, "Unrecognized image format (reported: #{content_type})" if moderation_type.nil?
    if moderation_type != content_type
      Honeybadger.notify("Actual content type differs from reported content type", context: {reported_content_type: content_type, actual_content_type: moderation_type})
    end
    AzureAiContentSafety.new(
      endpoint: CDO.azure_ai_content_safety_endpoint,
      api_key: CDO.azure_ai_content_safety_key
    ).moderate_image(moderation_io, moderation_type)
  rescue AzureAiContentSafety::AzureError => exception
    Honeybadger.notify(exception, context: {reported_content_type: content_type, actual_content_type: moderation_type})
    nil
  end

  # Scales up images smaller than MIN_MODERATION_DIMENSION on either dimension.
  # On errors, passes the original bytes through so Azure can still be tried.
  # Uses magic-byte sniffing to determine actual content type, overriding the
  # reported content_type value which may be incorrect.
  def self.scale_image_for_moderation_if_needed(image_data, content_type)
    raw_data = image_data.read
    actual_type = get_actual_content_type(raw_data)
    image = MiniMagick::Image.read(raw_data)
    width = image.width
    height = image.height
    if width >= MIN_MODERATION_DIMENSION && height >= MIN_MODERATION_DIMENSION
      return StringIO.new(raw_data), actual_type
    end

    scale = [MIN_MODERATION_DIMENSION.to_f / width, MIN_MODERATION_DIMENSION.to_f / height].max
    new_w = (width * scale).ceil
    new_h = (height * scale).ceil
    image.resize "#{new_w}x#{new_h}!"
    [StringIO.new(image.to_blob), actual_type]
  rescue MiniMagick::Invalid, MiniMagick::Error
    [StringIO.new(raw_data), actual_type]
  end

  # Returns the MIME type of image bytes by inspecting magic bytes.
  # Returns nil only when the format is completely unrecognizable.
  # Recognizes Azure-accepted types (png, gif, jpeg) and common
  # unsupported ones (webp, heic, heif) so error context is informative.
  def self.get_actual_content_type(bytes)
    return 'image/png'  if bytes.start_with?("\x89PNG\r\n\x1a\n".b)
    return 'image/gif'  if bytes.match?(/\AGIF8[79]a/n)
    return 'image/jpeg' if bytes.start_with?("\xff\xd8\xff".b)
    return 'image/webp' if bytes.start_with?('RIFF'.b) && bytes.byteslice(8, 4) == 'WEBP'
    # HEIC/HEIF: ISO Base Media File Format — ftyp box at offset 4 with a heic/heif brand.
    if bytes.bytesize >= 12 && bytes.byteslice(4, 4) == 'ftyp'
      return 'image/heic' if %w[heic heix hevm hevx heim heis].include?(bytes.byteslice(8, 4))
      return 'image/heif' if %w[mif1 msf1].include?(bytes.byteslice(8, 4))
    end
    nil
  end
end
