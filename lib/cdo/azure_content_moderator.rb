require 'net/http'

#
# Use Microsoft Azure Content Moderator to check images for adult or racy content.
#
# API Docs:
# https://westus.dev.cognitive.microsoft.com/docs/services/57cf753a3f9b070c105bd2c1/operations/57cf753a3f9b070868a1f66c
#
class AzureContentModerator
  def initialize(endpoint:, api_key:)
    @endpoint = endpoint
    @api_key = api_key
  end

  #
  # Give some binary image data and a content type, requests rating information
  # from Azure Content Moderation and returns a rating category.
  #
  # @param [String] image_data - binary image data to be rated
  # @param [String] content_type - one of image/bmp, image/gif, image/jpeg, image/png
  # @returns [:everyone|:racy|:adult]
  #
  def rate_image(image_data, content_type)
    raise StandardError.new("Cannot accept content-type #{content_type}") unless %w(
      image/bmp
      image/gif
      image/jpeg
      image/png
    ).include? content_type

    uri = URI(@endpoint + '/moderate/v1.0/ProcessImage/Evaluate')

    request = Net::HTTP::Post.new(uri.request_uri)
    request['Content-Type'] = content_type
    request['Ocp-Apim-Subscription-Key'] = @api_key
    request.body = image_data

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end

    raise StandardError.new('Failed to retrieve a rating from Azure') unless response.is_a?(Net::HTTPSuccess)

    result = JSON.parse(response.body)
    if result['IsImageAdultClassified']
      :adult
    elsif result['IsImageRacyClassified']
      :racy
    else
      :everyone
    end
  end
end
