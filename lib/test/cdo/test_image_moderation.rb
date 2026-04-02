require_relative '../test_helper'
require 'cdo/image_moderation'
require 'cdo/azure_ai_content_safety'

class ImageModerationTest < Minitest::Test
  def setup
    @image_body = StringIO.new('fake-image-body')
    @content_type = 'image/png'
    CDO.stubs(
      azure_ai_content_safety_key: 'fakekey',
      azure_ai_content_safety_endpoint: 'https://fake.endpoint'
    )
  end

  def test_returns_nil_when_missing_api_key
    CDO.stubs(azure_ai_content_safety_key: nil)
    AzureAiContentSafety.expects(:new).never
    assert_nil ImageModeration.moderate_image(@image_body, @content_type)
  end

  def test_uses_azure_when_api_key_present
    sample = {'categoriesAnalysis' => []}
    AzureAiContentSafety.any_instance.expects(:moderate_image).with(@image_body, @content_type).returns(sample).once
    assert_equal sample, ImageModeration.moderate_image(@image_body, @content_type)
  end

  def test_returns_nil_when_moderation_fails
    test_err = AzureAiContentSafety::RequestFailed.new('Test error')
    AzureAiContentSafety.any_instance.expects(:moderate_image).raises(test_err)
    Honeybadger.expects(:notify).once.with(test_err)
    assert_nil ImageModeration.moderate_image(@image_body, @content_type)
  end
end
