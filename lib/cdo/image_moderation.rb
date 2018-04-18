require 'cdo/azure_content_moderator'

module ImageModeration
  # Returns a content rating from an external service.
  # @param [String] image_data - binary image data to be rated
  # @param [String] content_type - image/bmp, image/gif, image/jpeg, image/png
  # @return [:everyone|:racy|:adult] Whether the image is suitable for everyone
  def self.rate_image_data(image_data, content_type)
    return :everyone unless CDO.azure_content_moderation_key
    AzureContentModerator.new(
      endpoint: CDO.azure_content_moderation_endpoint,
      api_key: CDO.azure_content_moderation_key
    ).rate_image(image_data, content_type)
  end
end
