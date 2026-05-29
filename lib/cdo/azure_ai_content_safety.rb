require 'net/http'
require 'base64'

#
# Use Microsoft Azure AI Content Safety to check images for harmful content.
#
# API Docs:
# https://learn.microsoft.com/en-us/rest/api/contentsafety/image-operations/analyze-image?view=rest-contentsafety-2024-09-01
#
class AzureAiContentSafety
  class AzureError < StandardError; end
  class RequestFailed < AzureError; end
  class UnsupportedContentType < AzureError; end

  API_PATH = '/contentsafety/image:analyze?api-version=2024-09-01'

  def initialize(endpoint:, api_key:)
    @endpoint = endpoint
    @api_key = api_key
  end

  #
  # Sends a JSON request with image data to Azure AI Content Safety
  # and returns the raw parsed JSON response.
  #
  # @param [IO] image_data - binary image data to be rated
  # @returns [Hash] the categoriesAnalysis response from Azure, e.g.:
  #   {"categoriesAnalysis"=>[{"category"=>"Sexual","severity"=>0}, {"category"=>"Hate","severity"=>0},
  #   {"category"=>"SelfHarm","severity"=>0}, {"category"=>"Violence","severity"=>0}]}, or
  #   null if the image is not moderated
  #   The severity value increases with the severity of the input content and possible values are:
  #   0 (safe), 2 (low), 4 (medium), 6 (high)
  # @raise [AzureAiContentSafety::RequestFailed] when the request is not successful.
  #
  def moderate_image(image_data)
    uri = URI(@endpoint + API_PATH)
    encoded_image = Base64.strict_encode64(image_data.read)

    request = Net::HTTP::Post.new(uri.request_uri)
    request['Content-Type'] = 'application/json'
    request['Ocp-Apim-Subscription-Key'] = @api_key
    request.body = {image: {content: encoded_image}}.to_json

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end

    raise RequestFailed.new(error_details(response)) unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  end

  #
  # Extract error information from a failed Azure response.
  # @param [Net::HTTPResponse] response
  # @return [String]
  #
  private def error_details(response)
    result = JSON.parse(response.body)
    <<~ERROR
      Request to Azure AI Content Safety failed with status #{response.code}
      #{result.dig('error', 'message')}
      #{result.dig('error', 'code')}
    ERROR
  rescue JSON::ParserError
    "Request to Azure AI Content Safety failed with status #{response.code}"
  end
end
