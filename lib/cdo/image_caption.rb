require 'digest'

require 'active_support/core_ext/integer/time'

require 'cdo/azure_image_caption'
require 'cdo/imagemagick_guard'
require 'cdo/shared_constants'
require 'dynamic_config/dcdo'

require 'honeybadger/ruby'
require 'observability/errors'

#
# Caption an image with Azure AI Vision, for Python Lab's theater. Nothing here
# raises: every failure returns nil and theater reads its own description.
#
module ImageCaption
  # Off until someone turns it on: this sends a student's work to a third party.
  CAPTIONS_ENABLED_DCDO_KEY = 'python_theater_captions_enabled'
  # Below this, Azure is guessing. Microsoft's own doc example scores 0.489.
  CONFIDENCE_FLOOR = 0.4

  # Azure AI Vision rejects anything larger.
  MAX_CAPTION_SIZE = 20 * 1024 * 1024

  CACHE_KEY_PREFIX = 'image_caption'
  CACHE_EXPIRY = 30.days

  # @param [String] image_data - raw image bytes to caption
  # @return [String, nil] the caption, or nil when captioning is off,
  #   unavailable, or not confident enough to read aloud
  def self.caption_image(image_data)
    return nil unless enabled?
    return nil unless supported_image?(image_data)
    return nil if image_data.bytesize > MAX_CAPTION_SIZE

    unless CDO.azure_computer_vision_key
      Observability::Errors.report(
        'Azure AI Vision API key is missing',
        context: {endpoint: CDO.azure_computer_vision_endpoint}
      )
      return nil
    end

    # The cache holds Azure's text and confidence, so the floor is checked again.
    key = cache_key(image_data)
    cached = CDO.shared_cache&.read(key)
    return confident_text(cached) if cached

    result = AzureImageCaption.new(
      endpoint: CDO.azure_computer_vision_endpoint,
      api_key: CDO.azure_computer_vision_key
    ).caption_image(image_data)

    CDO.shared_cache&.write(key, result, expires_in: CACHE_EXPIRY) if result
    confident_text(result)
  rescue AzureImageCaption::AzureError => exception
    Observability::Errors.report(exception)
    nil
  end

  # Keyed by the image alone, so nothing about the student is in the key.
  def self.cache_key(image_data)
    "#{CACHE_KEY_PREFIX}/#{Digest::SHA256.hexdigest(image_data)}"
  end

  def self.enabled?
    DCDO.get(CAPTIONS_ENABLED_DCDO_KEY, false)
  end

  # A guess Azure does not stand behind is worse than silence.
  def self.confident_text(result)
    return nil unless result.is_a?(Hash)

    text = result['text'].to_s.strip
    confidence = result['confidence']
    return nil if text.empty?
    return nil unless confidence.is_a?(Numeric)
    return nil if confidence < CONFIDENCE_FLOOR

    text
  end

  # Trust the bytes, not the caller's content type header.
  def self.supported_image?(image_data)
    actual_type = ImageMagickGuard.actual_content_type(image_data)
    SharedConstants::SAFE_AND_SUPPORTED_IMAGE_TYPES.include?(actual_type)
  end
end
