require_relative '../test_helper'
require 'cdo/image_moderation'
require 'cdo/azure_content_moderator'

class ImageModerationTest < Minitest::Test
  def test_returns_everyone_when_missing_api_key_data
    CDO.azure_content_moderation_key = nil
    AzureContentModerator.expects(:rate_image).never
    assert_equal :everyone, ImageModeration.rate_image_data('fake-image-body', 'image/png')
  end

  def test_uses_azure_when_api_key_present_data
    CDO.azure_content_moderation_key = 'fakekey'
    AzureContentModerator.any_instance.stubs(:rate_image).returns(:adult).once
    assert_equal :adult, ImageModeration.rate_image_data('fake-image-body', 'image/png')
  end
end
