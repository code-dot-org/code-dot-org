require 'net/http'

#
# Use Microsoft Azure Content Moderator to check images for adult or racy content.
#
# API Docs:
# https://westus.dev.cognitive.microsoft.com/docs/services/57cf753a3f9b070c105bd2c1/operations/57cf753a3f9b070868a1f66c
#
class AzureContentModerator
  class AzureError < StandardError; end
  class RequestFailed < AzureError; end
  class UnsupportedContentType < AzureError; end

  def initialize(endpoint:, api_key:)
    @endpoint = endpoint
    @api_key = api_key
  end

  #
  # Give some binary image data and a content type, requests rating information
  # from Azure Content Moderation and returns a rating category.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - one of image/bmp, image/gif, image/jpeg, image/png
  # @returns [:everyone|:racy|:adult]
  #
  def rate_image(image_data, content_type)
    raise UnsupportedContentType.new("Cannot accept content-type #{content_type}") unless %w(
      image/bmp
      image/gif
      image/jpeg
      image/png
    ).include? content_type

    uri = URI(@endpoint + '/moderate/v1.0/ProcessImage/Evaluate')

    request = Net::HTTP::Post.new(uri.request_uri)
    request['Content-Type'] = content_type
    request['Ocp-Apim-Subscription-Key'] = @api_key
    request['Transfer-Encoding'] = 'chunked'
    request.body_stream = image_data

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end

    raise RequestFailed.new(error_details(response)) unless response.is_a?(Net::HTTPSuccess)

    result = JSON.parse(response.body)
    if result['IsImageAdultClassified']
      :adult
    elsif result['IsImageRacyClassified']
      :racy
    else
      :everyone
    end
  end

  private

  #
  # Extract error information from a content moderation failure response
  # @param [Net::HTTPResponse] response
  # @return [String]
  #
  def error_details(response)
    result = JSON.parse(response.body)
    <<~ERROR
      Request to Azure failed with status #{response.code}
      #{result['Message']}
      #{result['Errors'].is_a?(Array) && result['Errors'].map(&:to_s).join('\n')}
    ERROR
  rescue
    "Request to Azure failed with status #{response.try?(:code)}"
  end
end
