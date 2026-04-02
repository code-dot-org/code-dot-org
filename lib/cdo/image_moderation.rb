require 'cdo/azure_content_moderator'
require 'cdo/azure_ai_content_safety'
require 'honeybadger/ruby'

module ImageModeration
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
