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
  # Given some binary image data and a content type, sends it to Azure AI
  # Content Safety and returns the raw parsed JSON response.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - one of image/gif, image/jpeg, image/png
  # @returns [Hash] the categoriesAnalysis response from Azure, e.g.:
  #   {"categoriesAnalysis"=>[{"category"=>"Sexual","severity"=>0}, {"category"=>"Hate","severity"=>0},
  #   {"category"=>"SelfHarm","severity"=>0}, {"category"=>"Violence","severity"=>0}]}, or
  #   null if the image is not moderated
  # @raise [AzureAiContentSafety::RequestFailed] when the request is not successful.
  # @raise [AzureAiContentSafety::UnsupportedContentType] when the content type is unsupported.
  #
  def moderate_image(image_data, content_type)
    raise UnsupportedContentType.new("Cannot accept content-type #{content_type}") unless %w(
      image/gif
      image/jpeg
      image/png
    ).include? content_type

    make_request(image_data)
  end

  #
  # Sends a JSON request to Azure AI Content Safety with base64-encoded image data.
  #
  # @param [IO] image_data - binary image data to be rated
  # @returns [Hash] the parsed response from Azure
  # @raise [AzureAiContentSafety::RequestFailed] when the request is not successful.
  #
  private def make_request(image_data)
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
  rescue
    "Request to Azure AI Content Safety failed with status #{response.try?(:code)}"
  end
end
