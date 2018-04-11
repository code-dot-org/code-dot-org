require_relative '../../../shared/test/test_helper'
require 'cdo/azure_content_moderator'
require 'minitest/autorun'

class AzureContentModeratorTest < Minitest::Test
  include SetupTest

  # Comment these out when regenerating VCR file.
  CDO.azure_content_moderation_endpoint = 'https://region.api.cognitive.microsoft.com/contentmoderator'
  CDO.azure_content_moderation_key = 'mocksecret'

  # Do additional VCR configuration so as to prevent the api key from being logged to the
  # YML cassette, instead replacing it with a placeholder string.
  VCR.configure do |c|
    c.filter_sensitive_data('<ENDPOINT>') {CDO.azure_content_moderation_endpoint}
    c.filter_sensitive_data('<API_KEY>') {CDO.azure_content_moderation_key}
  end

  def test_checks_image
    acm = AzureContentModerator.new(
      endpoint: CDO.azure_content_moderation_endpoint,
      api_key: CDO.azure_content_moderation_key
    )
    assert_equal :everyone, acm.rate_image('https://studio.code.org/notfound.jpg')
  end
end
