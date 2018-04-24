require 'cdo/azure_content_moderator'
require 'honeybadger'

module ImageModeration
  # Returns a content rating from an external service.
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/bmp, image/gif, image/jpeg, image/png
  # @param [String] image_url (optional) - Only used for metrics (for now).
  # @return [:everyone|:racy|:adult] Whether the image is suitable for everyone
  def self.rate_image(image_data, content_type, image_url = nil)
    return :everyone unless CDO.azure_content_moderation_key
    AzureContentModerator.new(
      endpoint: CDO.azure_content_moderation_endpoint,
      api_key: CDO.azure_content_moderation_key
    ).rate_image(image_data, content_type, image_url)
  rescue AzureContentModerator::AzureError => err
    # If something goes wrong with the image moderation service our fallback
    # behavior is to allow everything through, but we also want to notify
    # Honeybadger so that we can figure out exactly what is going wrong.
    Honeybadger.notify(err)
    :everyone
  end
end
