require 'cdo/azure_ai_content_safety'
require 'honeybadger/ruby'
require 'mini_magick'
require 'stringio'

module ImageModeration
  # Azure AI Content Safety requires both dimensions to be at least this many pixels.
  MIN_MODERATION_DIMENSION = 50
  # Azure AI Content Safety requires images to be at most 4MB.
  MAX_MODERATION_SIZE = 4 * 1024 * 1024

  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/gif, image/jpeg, image/png
  # @return [Hash, nil] categoriesAnalysis response from Azure, or nil on error
  def self.moderate_image(image_data, content_type)
    unless CDO.azure_ai_content_safety_key
      Honeybadger.notify("Azure AI Content Safety API key is missing", context: {endpoint: CDO.azure_ai_content_safety_endpoint})
      return nil
    end

    moderation_io, moderation_type = scale_image_for_moderation_if_needed(image_data, content_type)
    AzureAiContentSafety.new(
      endpoint: CDO.azure_ai_content_safety_endpoint,
      api_key: CDO.azure_ai_content_safety_key
    ).moderate_image(moderation_io, moderation_type)
  rescue AzureAiContentSafety::AzureError => exception
    Honeybadger.notify(exception)
    nil
  end

  # Scales images to meet Azure AI Content Safety dimension and size requirements.
  # Scales up images smaller than MIN_MODERATION_DIMENSION on either dimension.
  # Scales down images larger than MAX_MODERATION_SIZE.
  # On errors, passes the original bytes through so Azure can still be tried.
  def self.scale_image_for_moderation_if_needed(image_data, content_type)
    raw_data = image_data.read
    image = MiniMagick::Image.read(raw_data)
    width = image.width
    height = image.height

    if raw_data.bytesize > MAX_MODERATION_SIZE
      # Scale factor is approximate: file size is not strictly proportional to pixel
      # count for compressed formats, so scale conservatively to stay under the limit.
      scale = Math.sqrt(MAX_MODERATION_SIZE.to_f / raw_data.bytesize) * 0.9
      new_w = (width * scale).floor
      new_h = (height * scale).floor
      image.resize "#{new_w}x#{new_h}!"
      return [StringIO.new(image.to_blob), content_type]
    end

    if width >= MIN_MODERATION_DIMENSION && height >= MIN_MODERATION_DIMENSION
      return StringIO.new(raw_data), content_type
    end

    scale = [MIN_MODERATION_DIMENSION.to_f / width, MIN_MODERATION_DIMENSION.to_f / height].max
    new_w = (width * scale).ceil
    new_h = (height * scale).ceil
    image.resize "#{new_w}x#{new_h}!"
    image.format 'png'
    [StringIO.new(image.to_blob), 'image/png']
  rescue MiniMagick::Invalid, MiniMagick::Error
    [StringIO.new(raw_data), content_type]
  end
end
