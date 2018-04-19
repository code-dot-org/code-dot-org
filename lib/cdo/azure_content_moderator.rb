require 'net/http'
require 'cdo/firehose'

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
  # Given some binary image data and a content type, requests rating information
  # from Azure Content Moderation and returns a rating category.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - one of image/bmp, image/gif, image/jpeg, image/png
  # @returns [:everyone|:racy|:adult]
  # @raise [AzureContentModerator::RequestFailed] when the request is not
  #   successful.
  # @raise [AzureContentModerator::UnsupportedContentType] when no request is
  #   made because the specified content type cannot be moderated by this
  #   service.
  #
  def rate_image(image_data, content_type)
    raise UnsupportedContentType.new("Cannot accept content-type #{content_type}") unless %w(
      image/bmp
      image/gif
      image/jpeg
      image/png
    ).include? content_type

    report_request

    request_start_time = Time.now
    result = make_request(image_data, content_type)
    request_duration = Time.now - request_start_time

    rating = rating_from_azure_result(result)
    report_response(rating, result, request_duration)
    rating
  end

  private

  #
  # Sends a request to Azure to moderate the image.
  #
  # @param [IO] image_data - binary image data to be rated
  # @param [String] content_type - image/bmp, image/gif, image/jpeg, image/png
  # @returns [Hash] the parsed response from Azure
  # @raise [AzureContentModerator::RequestFailed] when the request is not
  #   successful.
  #
  def make_request(image_data, content_type)
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
  def rating_from_azure_result(result)
    if result['IsImageAdultClassified']
      :adult
    elsif result['IsImageRacyClassified']
      :racy
    else
      :everyone
    end
  end

  # Report to Firehose that we're about to make a request to Azure
  def report_request
    FirehoseClient.instance.put_record(
      study: 'azure-content-moderation',
      study_group: 'v1',
      event: 'moderation-request',
    )
  end

  # Report the response we got from Azure to Firehose
  def report_response(rating, data, request_duration)
    FirehoseClient.instance.put_record(
      study: 'azure-content-moderation',
      study_group: 'v1',
      event: 'moderation-result',
      data_string: rating.to_s,
      data_json: data.
        slice(
          'AdultClassificationScore',
          'IsImageAdultClassified',
          'RacyClassificationScore',
          'IsImageRacyClassified'
        ).
        merge('RequestDuration' => request_duration).
        to_json
    )
  end

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
