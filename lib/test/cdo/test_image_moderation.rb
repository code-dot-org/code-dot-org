require_relative '../test_helper'
require 'cdo/image_moderation'
require 'cdo/azure_ai_content_safety'
require 'mini_magick'
require 'tempfile'

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
    Honeybadger.expects(:notify).once.with(
      "Azure AI Content Safety API key is missing",
      context: {endpoint: CDO.azure_ai_content_safety_endpoint}
    )
    assert_nil ImageModeration.moderate_image(@image_body, @content_type)
  end

  def test_uses_azure_when_api_key_present
    sample = {'categoriesAnalysis' => []}
    AzureAiContentSafety.any_instance.expects(:moderate_image).with do |io, ct|
      io.read == 'fake-image-body' && ct == @content_type
    end.returns(sample).once
    assert_equal sample, ImageModeration.moderate_image(@image_body, @content_type)
  end

  def test_scales_small_images_before_azure
    blob = tiny_png_blob(10, 10)
    sample = {'categoriesAnalysis' => []}
    captured = {}
    AzureAiContentSafety.any_instance.expects(:moderate_image).with do |io, ct|
      captured[:bytes] = io.read
      captured[:content_type] = ct
      true
    end.returns(sample).once

    assert_equal sample, ImageModeration.moderate_image(StringIO.new(blob), 'image/png')

    out = MiniMagick::Image.read(captured[:bytes])
    assert_operator out.width, :>=, ImageModeration::MIN_MODERATION_DIMENSION
    assert_operator out.height, :>=, ImageModeration::MIN_MODERATION_DIMENSION
    assert_equal 'image/png', captured[:content_type]
  end

  def test_large_images_pass_through_unscaled
    blob = tiny_png_blob(100, 100)
    sample = {'categoriesAnalysis' => []}
    AzureAiContentSafety.any_instance.expects(:moderate_image).with do |io, ct|
      io.read == blob && ct == 'image/png'
    end.returns(sample).once

    assert_equal sample, ImageModeration.moderate_image(StringIO.new(blob), 'image/png')
  end

  def test_returns_nil_when_moderation_fails
    test_err = AzureAiContentSafety::RequestFailed.new('Test error')
    AzureAiContentSafety.any_instance.expects(:moderate_image).raises(test_err)
    Honeybadger.expects(:notify).once.with(test_err)
    assert_nil ImageModeration.moderate_image(@image_body, @content_type)
  end

  # Tempfile is unlinked when the block returns (see Tempfile.create).
  private def tiny_png_blob(width, height)
    Tempfile.create(%w[tiny .png]) do |f|
      MiniMagick::Tool::Convert.new do |c|
        c.size "#{width}x#{height}"
        c << 'xc:white'
        c << f.path
      end
      File.binread(f.path)
    end
  end
end
