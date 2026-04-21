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
    blob = tiny_png_blob(100, 100)
    assert_nil ImageModeration.moderate_image(StringIO.new(blob), 'image/png')
  end

  def test_uses_azure_when_api_key_present
    blob = tiny_png_blob(100, 100)
    sample = {'categoriesAnalysis' => []}
    AzureAiContentSafety.any_instance.expects(:moderate_image).with do |io|
      io.read == blob
    end.returns(sample).once
    assert_equal sample, ImageModeration.moderate_image(StringIO.new(blob), 'image/png')
  end

  def test_scales_small_images_before_azure
    blob = tiny_png_blob(10, 10)
    sample = {'categoriesAnalysis' => []}
    captured_bytes = nil
    AzureAiContentSafety.any_instance.expects(:moderate_image).with do |io|
      captured_bytes = io.read
      true
    end.returns(sample).once

    assert_equal sample, ImageModeration.moderate_image(StringIO.new(blob), 'image/png')

    out = MiniMagick::Image.read(captured_bytes)
    assert_operator out.width, :>=, ImageModeration::MIN_MODERATION_DIMENSION
    assert_operator out.height, :>=, ImageModeration::MIN_MODERATION_DIMENSION
  end

  def test_large_images_pass_through_unscaled
    blob = tiny_png_blob(100, 100)
    sample = {'categoriesAnalysis' => []}
    AzureAiContentSafety.any_instance.expects(:moderate_image).with do |io|
      io.read == blob
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

  # Extreme-ratio image: one side below MIN, the other above MAX.
  # e.g. 8000x40 -> MIN upscale brings it to ~10000x50, then MAX downscale
  # brings it to ~7200x36. Both MAX constraints must be satisfied; MIN is
  # not achievable on the short side after the MAX downscale for such ratios.
  def test_extreme_ratio_image_satisfies_max_dimension_constraints
    blob = tiny_png_blob(8000, 40)
    io, ct = ImageModeration.scale_image_for_moderation_if_needed(StringIO.new(blob), 'image/png')
    assert_equal 'image/png', ct
    out = MiniMagick::Image.read(io.read)
    assert_operator out.width, :<=, ImageModeration::MAX_MODERATION_DIMENSION
    assert_operator out.height, :<=, ImageModeration::MAX_MODERATION_DIMENSION
  end

  # Image that exceeds both MAX_MODERATION_DIMENSION and MAX_MODERATION_SIZE.
  # Verifies both downscaling passes run sequentially and all constraints are met.
  def test_oversized_dimension_and_bytes_satisfies_all_constraints
    blob = large_png_blob_over_max_size_and_dimension
    io, ct = ImageModeration.scale_image_for_moderation_if_needed(StringIO.new(blob), 'image/png')
    assert_equal 'image/png', ct
    bytes = io.read
    out = MiniMagick::Image.read(bytes)
    assert_operator out.width, :<=, ImageModeration::MAX_MODERATION_DIMENSION
    assert_operator out.height, :<=, ImageModeration::MAX_MODERATION_DIMENSION
    assert_operator bytes.bytesize, :<=, ImageModeration::MAX_MODERATION_SIZE
  end

  def test_returns_nil_when_moderation_fails
    blob = tiny_png_blob(100, 100)
    test_err = AzureAiContentSafety::RequestFailed.new('Test error')
    AzureAiContentSafety.any_instance.expects(:moderate_image).raises(test_err)
    Honeybadger.expects(:notify).once.with(
      test_err,
      context: {reported_content_type: 'image/png', actual_content_type: 'image/png'}
    )
    assert_nil ImageModeration.moderate_image(StringIO.new(blob), 'image/png')
  end

  def test_raises_for_unrecognized_image_format
    AzureAiContentSafety.expects(:new).never
    assert_raises AzureAiContentSafety::UnsupportedContentType do
      ImageModeration.moderate_image(StringIO.new('not-an-image'), 'any')
    end
  end

  def test_sniff_overrides_wrong_content_type
    blob = tiny_png_blob(100, 100)
    sample = {'categoriesAnalysis' => []}
    AzureAiContentSafety.any_instance.expects(:moderate_image).returns(sample).once

    result = ImageModeration.moderate_image(StringIO.new(blob), 'any')
    assert_equal sample, result
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
        # plasma:fractal is an ImageMagick built-in image generator that produces
        # a randomly colored plasma gradient. It results in enough pixel variation to defeat
        # PNG's compression algorithm so we can produce a large image that exceeds MAX_MODERATION_SIZE.
        c << 'plasma:fractal'
        c.compress 'None'
        c << f.path
      end
      File.binread(f.path)
    end
  end

  # Produces an uncompressed PNG that exceeds both MAX_MODERATION_DIMENSION (7200px)
  # and MAX_MODERATION_SIZE (4MB). 7300x400 plasma:fractal at ~8.7MB uncompressed
  # exercises the sequential dimension-then-size downscaling path.
  private def large_png_blob_over_max_size_and_dimension
    Tempfile.create(%w[large_wide .png]) do |f|
      MiniMagick::Tool::Convert.new do |c|
        c.size '7300x400'
        c << 'plasma:fractal'
        c.compress 'None'
        c << f.path
      end
      File.binread(f.path)
    end
  end
end
