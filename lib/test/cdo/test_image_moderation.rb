require_relative '../test_helper'
require 'cdo/image_moderation'
require 'cdo/azure_content_moderator'

class ImageModerationTest < Minitest::Test
  def setup
    @image_body = StringIO.new('fake-image-body')
    @content_type = 'image/png'
  end

  def test_returns_everyone_when_missing_api_key
    CDO.azure_content_moderation_key = nil
    AzureContentModerator.expects(:rate_image).never
    assert_equal :everyone, ImageModeration.rate_image(@image_body, @content_type)
  end

  def test_uses_azure_when_api_key_present
    CDO.azure_content_moderation_key = 'fakekey'
    AzureContentModerator.any_instance.stubs(:rate_image).returns(:adult).once
    assert_equal :adult, ImageModeration.rate_image(@image_body, @content_type)
  end

  def test_allow_everything_when_moderation_fails
    CDO.azure_content_moderation_key = 'fakekey'
    test_err = AzureContentModerator::AzureError.new('Test error')
    AzureContentModerator.any_instance.stubs(:rate_image).raises(test_err)
    Honeybadger.expects(:notify).once.with(test_err)
    assert_equal :everyone, ImageModeration.rate_image(@image_body, @content_type)
  end
end
