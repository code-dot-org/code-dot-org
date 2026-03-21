require 'net/http'
require 'base64'
require 'dynamic_config/dcdo'

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

  # Categories returned by the Azure AI Content Safety API
  SEXUAL = 'Sexual'
  VIOLENCE = 'Violence'
  HATE = 'Hate'
  SELF_HARM = 'SelfHarm'

  def initialize(endpoint:, api_key:)
    @endpoint = endpoint
    @api_key = api_key
  end

  #
  # Given some binary image data and a content type, requests rating information
  # from Azure AI Content Safety and returns a rating category.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - one of image/gif, image/jpeg, image/png
  # @returns [:everyone|:racy|:adult]
  # @raise [AzureAiContentSafety::RequestFailed] when the request is not successful.
  # @raise [AzureAiContentSafety::UnsupportedContentType] when the content type is unsupported.
  #
  def moderate_image(image_data, content_type)
    raise UnsupportedContentType.new("Cannot accept content-type #{content_type}") unless %w(
      image/gif
      image/jpeg
      image/png
    ).include? content_type

    result = make_request(image_data)
    rating_from_azure_result(result)
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
  # Maps Azure AI Content Safety severity levels to our rating system.
  #
  # The API returns severity 0 (safe), 2 (low), 4 (medium), 6 (high) for each
  # category. We focus on Sexual and Violence as the primary categories.
  #
  # @param [Hash] result - the parsed response from Azure
  # @returns [:everyone|:racy|:adult]
  #
  private def rating_from_azure_result(result)
    categories = result['categoriesAnalysis'] || []
    severity_by_category = categories.each_with_object({}) do |c, h|
      h[c['category']] = c['severity'].to_i
    end

    sexual_severity = severity_by_category[SEXUAL] || 0
    violence_severity = severity_by_category[VIOLENCE] || 0

    if sexual_severity >= adult_severity_threshold || violence_severity >= violence_adult_severity_threshold
      :adult
    elsif sexual_severity >= racy_severity_threshold || violence_severity >= violence_racy_severity_threshold
      :racy
    else
      :everyone
    end
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

  # DCDO variables allowing dynamic configuration of image moderation thresholds.
  # DCDO config is structured like this:
  #
  # image_moderation:
  #   adult_severity_threshold: 4           # Sexual severity >= this → :adult
  #   racy_severity_threshold: 2            # Sexual severity >= this → :racy
  #   violence_adult_severity_threshold: 6  # Violence severity >= this → :adult
  #   violence_racy_severity_threshold: 4   # Violence severity >= this → :racy

  private def adult_severity_threshold
    dynamic_config['adult_severity_threshold'] || 4
  end

  private def racy_severity_threshold
    dynamic_config['racy_severity_threshold'] || 2
  end

  private def violence_adult_severity_threshold
    dynamic_config['violence_adult_severity_threshold'] || 6
  end

  private def violence_racy_severity_threshold
    dynamic_config['violence_racy_severity_threshold'] || 4
  end

  private def dynamic_config
    DCDO.get('image_moderation', {})
  end
end
