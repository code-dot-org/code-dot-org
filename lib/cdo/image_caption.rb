require 'digest'

require 'active_support/core_ext/integer/time'

require 'cdo/azure_image_caption'
require 'cdo/imagemagick_guard'
require 'cdo/shared_constants'
require 'dynamic_config/dcdo'

require 'honeybadger/ruby'
require 'observability/errors'

#
# Caption an image with Azure AI Vision, for Python Lab's theater.
#
# Theater already describes a scene exactly, from the draw calls the student
# wrote. A caption adds a sentence of gist on top of that.
#
# Nothing here raises. Every failure returns nil, and theater reads its own
# description instead.
#
module ImageCaption
  # Captioning sends a student's work to a third party, so it stays off until
  # someone turns it on for an environment.
  CAPTIONS_ENABLED_DCDO_KEY = 'python_theater_captions_enabled'
  # Below this, Azure is guessing. Tunable without a deploy, because the right
  # floor is something to learn from real student work.
  CONFIDENCE_FLOOR_DCDO_KEY = 'python_theater_caption_confidence_floor'
  DEFAULT_CONFIDENCE_FLOOR = 0.5

  # Azure AI Vision rejects anything larger.
  MAX_CAPTION_SIZE = 20 * 1024 * 1024

  CACHE_KEY_PREFIX = 'image_caption'
  CACHE_EXPIRY = 30.days

  #
  # @param [String] image_data - raw image bytes to caption
  # @return [String, nil] the caption, or nil when captioning is off,
  #   unavailable, or not confident enough to be worth reading aloud
  #
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

    # Re-running an unchanged program renders the same bytes, so it earns the
    # same caption. Students re-run constantly: this spares them the wait and
    # us the bill.
    key = cache_key(image_data)
    cached = CDO.shared_cache&.read(key)
    return cached if cached

    result = AzureImageCaption.new(
      endpoint: CDO.azure_computer_vision_endpoint,
      api_key: CDO.azure_computer_vision_key
    ).caption_image(image_data)

    caption = confident_text(result)
    # Only captions are cached. Asking again about a picture Azure declined is
    # cheap, and a cached refusal would outlive a change to the floor.
    CDO.shared_cache&.write(key, caption, expires_in: CACHE_EXPIRY) if caption
    caption
  rescue AzureImageCaption::AzureError => exception
    Observability::Errors.report(exception)
    nil
  end

  # Keyed by the image itself, so two students who drew the same picture share
  # a caption and nothing about either student is in the key.
  def self.cache_key(image_data)
    "#{CACHE_KEY_PREFIX}/#{Digest::SHA256.hexdigest(image_data)}"
  end

  def self.enabled?
    DCDO.get(CAPTIONS_ENABLED_DCDO_KEY, false)
  end

  # Only a caption Azure itself stands behind. A low-confidence guess read to a
  # student who cannot check it against the stage is worse than silence.
  def self.confident_text(result)
    return nil unless result.is_a?(Hash)

    text = result['text'].to_s.strip
    confidence = result['confidence']
    return nil if text.empty?
    return nil unless confidence.is_a?(Numeric)
    return nil if confidence < DCDO.get(CONFIDENCE_FLOOR_DCDO_KEY, DEFAULT_CONFIDENCE_FLOOR)

    text
  end

  # Trust the bytes, not the request's content type header, which is whatever
  # the caller wrote. An unsupported format is a wasted call to Azure.
  def self.supported_image?(image_data)
    actual_type = ImageMagickGuard.actual_content_type(image_data)
    SharedConstants::SAFE_AND_SUPPORTED_IMAGE_TYPES.include?(actual_type)
  end
end
