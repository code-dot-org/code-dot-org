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

  def test_scales_down_wide_images_exceeding_max_dimension
    blob = tiny_png_blob(7300, 100)
    io, ct = ImageModeration.scale_image_for_moderation_if_needed(StringIO.new(blob), 'image/png')
    assert_equal 'image/png', ct
    out = MiniMagick::Image.read(io.read)
    assert_operator out.width, :<=, ImageModeration::MAX_MODERATION_DIMENSION
    assert_operator out.height, :<=, ImageModeration::MAX_MODERATION_DIMENSION
    assert_operator out.width, :>=, ImageModeration::MIN_MODERATION_DIMENSION
    assert_operator out.height, :>=, ImageModeration::MIN_MODERATION_DIMENSION
  end

  def test_scales_down_tall_images_exceeding_max_dimension
    blob = tiny_png_blob(100, 7300)
    io, ct = ImageModeration.scale_image_for_moderation_if_needed(StringIO.new(blob), 'image/png')
    assert_equal 'image/png', ct
    out = MiniMagick::Image.read(io.read)
    assert_operator out.width, :<=, ImageModeration::MAX_MODERATION_DIMENSION
    assert_operator out.height, :<=, ImageModeration::MAX_MODERATION_DIMENSION
  end

  def test_scales_down_large_real_image_exceeding_max_byte_size
    blob = large_png_blob_over_max_size
    io, ct = ImageModeration.scale_image_for_moderation_if_needed(StringIO.new(blob), 'image/png')
    assert_operator io.read.bytesize, :<=, ImageModeration::MAX_MODERATION_SIZE
    assert_equal 'image/png', ct
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

  # Produces an uncompressed PNG large enough to exceed MAX_MODERATION_SIZE.
  # A 1500x1500 noise image encodes to ~6-7MB without compression.
  private def large_png_blob_over_max_size
    Tempfile.create(%w[large .png]) do |f|
      MiniMagick::Tool::Convert.new do |c|
        c.size '1500x1500'
        # plasma:fractal is an ImageMagick build-in image generator that produces
        # a randomly colored plasma gradient. It results in enough pixel variation to defeat
        # PNG's compression algorithm so we can produce a large image that exceeds MAX_MODERATION_SIZE.
        c << 'plasma:fractal'
        c.compress 'None'
        c << f.path
      end
      File.binread(f.path)
    end
  end
end
