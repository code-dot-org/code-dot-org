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
  # Give a publicly-accessible image URL, requests rating information from
  # Azure Content Moderation and return a rating category.
  #
  # @param [String] image_url - must be reachable from the Azure service.
  # @returns [:everyone|:racy|:adult]
  def rate_image(image_url)
    uri = URI(@endpoint + '/moderate/v1.0/ProcessImage/Evaluate')

    request = Net::HTTP::Post.new(uri.request_uri)
    request['Content-Type'] = 'application/json'
    request['Ocp-Apim-Subscription-Key'] = @api_key
    request.body = {
      DataRepresentation: 'URL',
      Value: image_url
    }.to_json

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end

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
