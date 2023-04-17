require 'net/http'
require 'cdo/firehose'
require 'dynamic_config/dcdo'

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

  # Keys for the response object
  ADULT_SCORE = 'AdultClassificationScore'
  RACY_SCORE = 'RacyClassificationScore'
  IS_ADULT = 'IsImageAdultClassified'
  IS_RACY = 'IsImageRacyClassified'

  def initialize(endpoint:, api_key:)
    @endpoint = endpoint
    @api_key = api_key
  end

  #
  # Given some binary image data and a content type, requests rating information
  # from Azure Content Moderation and returns a rating category.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - one of image/bmp, image/gif, image/jpeg, image/png
  # @param [String] image_url (optional) - Only used for metrics
  # @returns [:everyone|:racy|:adult]
  # @raise [AzureContentModerator::RequestFailed] when the request is not
  #   successful.
  # @raise [AzureContentModerator::UnsupportedContentType] when no request is
  #   made because the specified content type cannot be moderated by this
  #   service.
  #
  def rate_image(image_data, content_type, image_url = nil)
    raise UnsupportedContentType.new("Cannot accept content-type #{content_type}") unless %w(
      image/bmp
      image/gif
      image/jpeg
      image/png
    ).include? content_type

    report_request(image_url)

    request_start_time = Time.now
    result = make_request(image_data, content_type)
    request_duration = Time.now - request_start_time

    rating = rating_from_azure_result(result)
    report_response(image_url, rating, result, request_duration)
    rating
  end

  #
  # Sends a request to Azure to moderate the image.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/bmp, image/gif, image/jpeg, image/png
  # @returns [Hash] the parsed response from Azure
  # @raise [AzureContentModerator::RequestFailed] when the request is not
  #   successful.
  #
  private def make_request(image_data, content_type)
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

    JSON.parse(response.body)
  end

  #
  # Given a raw Azure content moderation result, returns a simplified rating
  # used in our system to decide how to proceed.
  #
  # @param [Hash] the parsed response from Auzre
  # @returns [:everyone|:racy|:adult]
  #
  private def rating_from_azure_result(result)
    if result[ADULT_SCORE] >= adult_threshold
      :adult
    elsif result[RACY_SCORE] >= racy_threshold
      :racy
    else
      :everyone
    end
  end

  # Report to Firehose that we're about to make a request to Azure
  private def report_request(image_url)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'azure-content-moderation',
        study_group: 'v1',
        event: 'moderation-request',
        data_json: {
          ImageUrl: image_url
        }.to_json
      }
    )
  end

  # Report the response we got from Azure to Firehose
  private def report_response(image_url, rating, data, request_duration)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'azure-content-moderation',
        study_group: 'v1',
        event: 'moderation-result',
        data_string: rating.to_s,
        data_json: data.
          slice(ADULT_SCORE, IS_ADULT, RACY_SCORE, IS_RACY).
          merge(
            RequestDuration: request_duration,
            ImageUrl: image_url,
            RacyThresholdUsed: racy_threshold,
            AdultThresholdUsed: adult_threshold,
          ).
          to_json
      }
    )
  end

  #
  # Extract error information from a content moderation failure response
  # @param [Net::HTTPResponse] response
  # @return [String]
  #
  private def error_details(response)
    result = JSON.parse(response.body)
    <<~ERROR
      Request to Azure failed with status #{response.code}
      #{result['Message']}
      #{result['Errors'].is_a?(Array) && result['Errors'].map(&:to_s).join('\n')}
    ERROR
  rescue
    "Request to Azure failed with status #{response.try?(:code)}"
  end

  # DCDO variables allowing dynamic configuration of automated image
  # moderation behaviors.  DCDO config is structured like this:
  #
  # image_moderation:
  #   racy_threshold: 0.48
  #   adult_threshold: 0.48
  #   limited_project_gallery: true

  # The minimum "racy" score that earns a :racy rating.
  private def racy_threshold
    # 0.32 is Azure's default threshold for racy content.
    dynamic_config['racy_threshold'] || 0.32
  end

  # The minimum "adult" score that earns an :adult rating.
  private def adult_threshold
    # 0.48 is Azure's default threshold for adult content.
    dynamic_config['adult_threshold'] || 0.48
  end

  # If true, we only show featured projects in the App Lab and Game Lab
  # sections of the public project gallery.
  private def limited_project_gallery?
    dynamic_config['limited_project_gallery'] || true
  end

  private def dynamic_config
    DCDO.get('image_moderation', {})
  end
end
