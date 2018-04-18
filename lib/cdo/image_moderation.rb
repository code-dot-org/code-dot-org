require 'cdo/azure_content_moderator'

module ImageModeration
  # Returns a content rating from an external service.
  # @param [String] image_url a public url to the image to be rated
  # @return [:everyone|:racy|:adult] Whether the image is suitable for everyone
  def self.rate_image(image_url)
    return :everyone unless CDO.azure_content_moderation_key

    AzureContentModerator.new(
      endpoint: CDO.azure_content_moderation_endpoint,
      api_key: CDO.azure_content_moderation_key
    ).rate_image(image_url)
  end
end
