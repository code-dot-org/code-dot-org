require 'net/http'
require 'json'
require 'openssl'

#
# Use Microsoft Azure AI Vision to caption an image in one sentence.
# https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/how-to/call-analyze-image-40
#
class AzureImageCaption
  class AzureError < StandardError; end
  class RequestFailed < AzureError; end

  # gender-neutral-caption stops the model guessing a gender from a drawing.
  API_PATH = '/computervision/imageanalysis:analyze' \
    '?api-version=2024-02-01' \
    '&features=caption' \
    '&gender-neutral-caption=true' \
    '&language=en' \
    '&model-version=latest'

  # A caption is a supplement, so it is not worth waiting long for.
  OPEN_TIMEOUT = 2
  READ_TIMEOUT = 5

  def initialize(endpoint:, api_key:)
    @endpoint = endpoint
    @api_key = api_key
  end

  # @param [String] image_data - binary image data to caption
  # @return [Hash, nil] the captionResult, e.g.
  #   {"text" => "a red circle on a white background", "confidence" => 0.7421},
  #   or nil when Azure returned no caption.
  # @raise [AzureImageCaption::RequestFailed] when the request is not successful.
  def caption_image(image_data)
    uri = URI(@endpoint + API_PATH)

    request = Net::HTTP::Post.new(uri.request_uri)
    # Raw bytes, unlike Content Safety, which takes base64 in a JSON envelope.
    request['Content-Type'] = 'application/octet-stream'
    request['Ocp-Apim-Subscription-Key'] = @api_key
    request.body = image_data

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: uri.scheme == 'https',
      open_timeout: OPEN_TIMEOUT,
      read_timeout: READ_TIMEOUT
    ) do |http|
      http.request(request)
    end

    raise RequestFailed.new(error_details(response)) unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)['captionResult']
  rescue JSON::ParserError => exception
    raise RequestFailed.new("Unparseable Azure AI Vision response: #{exception.message}")
  # Transport failures arrive as plain StandardErrors. Unwrapped they slip past
  # ImageCaption's rescue and turn an Azure outage into a 500.
  rescue Net::OpenTimeout, Net::ReadTimeout, SocketError, SystemCallError, OpenSSL::SSL::SSLError => exception
    raise RequestFailed.new("Azure AI Vision request failed: #{exception.class}: #{exception.message}")
  end

  # Extract error information from a failed Azure response.
  # @param [Net::HTTPResponse] response
  # @return [String]
  private def error_details(response)
    result = JSON.parse(response.body)
    "Request to Azure AI Vision failed with status #{response.code}: " \
      "#{result.dig('error', 'code')} #{result.dig('error', 'message')}"
  rescue JSON::ParserError
    "Request to Azure AI Vision failed with status #{response.code}"
  end
end
