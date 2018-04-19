require_relative '../../../shared/test/test_helper'
require 'cdo/azure_content_moderator'
require 'minitest/autorun'
require 'open-uri'

class AzureContentModeratorTest < Minitest::Test
  include SetupTest

  # Comment these out when regenerating VCR file.
  CDO.azure_content_moderation_endpoint = 'https://region.api.cognitive.microsoft.com/contentmoderator'
  CDO.azure_content_moderation_key = 'fake_azure_api_key'

  # Do additional VCR configuration so as to prevent the api key from being logged to the
  # YML cassette, instead replacing it with a placeholder string.
  VCR.configure do |c|
    c.filter_sensitive_data('<AZURE_ENDPOINT>') {CDO.azure_content_moderation_endpoint}
    c.filter_sensitive_data('<AZURE_API_KEY>') {CDO.azure_content_moderation_key}
  end

  def setup
    @acm = AzureContentModerator.new(
      endpoint: CDO.azure_content_moderation_endpoint,
      api_key: CDO.azure_content_moderation_key
    )
  end

  def test_checks_jpg_image
    expect_firehose_log_request
    expect_firehose_log_result
    image_data = open('https://studio.code.org/notfound.jpg')
    assert_equal :everyone, @acm.rate_image(image_data, 'image/jpeg')
  end

  def test_checks_png_image
    expect_firehose_log_request
    expect_firehose_log_result
    image_data = open('https://code.org/images/infographics/fit-800/diversity-courses-updated-05-23.png')
    assert_equal :everyone, @acm.rate_image(image_data, 'image/png')
  end

  def test_raise_on_image_too_small
    expect_firehose_log_request
    # This image is smaller than the Azure content moderator's minimum size.
    image_data = open('https://code.org/images/icons/medium-monogram-white.png')
    assert_raises AzureContentModerator::RequestFailed do
      @acm.rate_image(image_data, 'image/png')
    end
  end

  def test_raise_on_unacceptable_content_type
    expect_no_firehose
    Net::HTTP.expects(:start).never
    assert_raises AzureContentModerator::UnsupportedContentType do
      @acm.rate_image(StringIO.new('some text content'), 'text/plain')
    end
  end

  private

  def expect_firehose_log_request
    FirehoseClient.any_instance.expects(:put_record).with(
      study: 'azure-content-moderation',
      study_group: 'v1',
      event: 'moderation-request'
    )
  end

  def expect_firehose_log_result
    FirehoseClient.any_instance.expects(:put_record).with do |data|
      data[:study] == 'azure-content-moderation' &&
        data[:study_group] == 'v1' &&
        data[:event] == 'moderation-result' &&
        %w(everyone racy adult).include?(data[:data_string]) &&
        JSON.parse(data[:data_json]).keys == %w(
          AdultClassificationScore
          IsImageAdultClassified
          RacyClassificationScore
          IsImageRacyClassified
          RequestDuration
        )
    end
  end

  def expect_no_firehose
    FirehoseClient.any_instance.expects(:put_record).never
  end
end
