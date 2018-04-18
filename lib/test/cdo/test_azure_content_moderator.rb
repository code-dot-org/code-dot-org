require_relative '../../../shared/test/test_helper'
require 'cdo/azure_content_moderator'
require 'minitest/autorun'
require 'open-uri'

class AzureContentModeratorTest < Minitest::Test
  include SetupTest

  # Comment these out when regenerating VCR file.
  # CDO.azure_content_moderation_endpoint = 'https://region.api.cognitive.microsoft.com/contentmoderator'
  # CDO.azure_content_moderation_key = 'fake_azure_api_key'

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
    image_data = open('https://studio.code.org/notfound.jpg')
    assert_equal :everyone, @acm.rate_image(image_data, 'image/jpeg')
  end

  def test_checks_png_image
    image_data = open('https://code.org/images/infographics/fit-800/diversity-courses-updated-05-23.png')
    assert_equal :everyone, @acm.rate_image(image_data, 'image/png')
  end

  def test_raise_on_image_too_small
    # This image is smaller than the Azure content moderator's minimum size.
    image_data = open('https://code.org/images/icons/medium-monogram-white.png')
    assert_raises AzureContentModerator::RequestFailed do
      @acm.rate_image(image_data, 'image/png')
    end
  end

  def test_raise_on_unacceptable_content_type
    Net::HTTP.expects(:start).never
    assert_raises AzureContentModerator::UnsupportedContentType do
      @acm.rate_image(StringIO.new('some text content'), 'text/plain')
    end
  end
end
