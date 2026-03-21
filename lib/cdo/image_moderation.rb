require 'cdo/azure_content_moderator'
require 'cdo/azure_ai_content_safety'
require 'honeybadger/ruby'
require 'cdo/firehose'

module ImageModeration
  # Returns a content rating from an external service.
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/bmp, image/gif, image/jpeg, image/png
  # @return [:everyone|:racy|:adult|:unknown] Whether the image is suitable for everyone
  def self.rate_image(image_data, content_type)
    return :everyone unless CDO.azure_content_moderation_key
    AzureContentModerator.new(
      endpoint: CDO.azure_content_moderation_endpoint,
      api_key: CDO.azure_content_moderation_key
    ).rate_image(image_data, content_type)
  rescue AzureContentModerator::AzureError => exception
    # If something goes wrong with the image moderation service our fallback
    # behavior is to allow everything through, but we also want to notify
    # Honeybadger so that we can figure out exactly what is going wrong.
    Honeybadger.notify(exception)
    :unknown
  end

  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/gif, image/jpeg, image/png
  # @return [Hash, nil] raw categoriesAnalysis response from Azure, or nil on error
  def self.moderate_image(image_data, content_type)
    return nil unless CDO.azure_ai_content_safety_key
    AzureAiContentSafety.new(
      endpoint: CDO.azure_ai_content_safety_endpoint,
      api_key: CDO.azure_ai_content_safety_key
    ).moderate_image(image_data, content_type)
  rescue AzureAiContentSafety::AzureError => exception
    Honeybadger.notify(exception)
    nil
  end
end
