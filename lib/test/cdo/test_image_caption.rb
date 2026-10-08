require_relative '../test_helper'
require 'cdo/image_caption'
require 'cdo/azure_image_caption'
require 'mini_magick'
require 'tempfile'
require 'active_support/cache'

class ImageCaptionTest < Minitest::Test
  def setup
    CDO.stubs(
      azure_computer_vision_key: 'fakekey',
      azure_computer_vision_endpoint: 'https://fake.endpoint'
    )
    DCDO.stubs(:get).with(ImageCaption::CAPTIONS_ENABLED_DCDO_KEY, false).returns(true)
    @cache = ActiveSupport::Cache::MemoryStore.new
    CDO.stubs(shared_cache: @cache)
  end

  # --- the flag ---

  def test_returns_nil_and_calls_nothing_when_the_flag_is_off
    DCDO.stubs(:get).with(ImageCaption::CAPTIONS_ENABLED_DCDO_KEY, false).returns(false)
    # Off means no student image leaves the building, so the check comes first.
    AzureImageCaption.expects(:new).never
    assert_nil ImageCaption.caption_image(png_blob)
  end

  def test_defaults_to_off
    DCDO.unstub(:get)
    # The default handed to DCDO is the thing under test.
    DCDO.expects(:get).with(ImageCaption::CAPTIONS_ENABLED_DCDO_KEY, false).returns(false)
    refute ImageCaption.enabled?
  end

  # --- the caption ---

  def test_returns_the_caption_text_stripped
    stub_caption("  a red circle\n", 0.81)
    assert_equal 'a red circle', ImageCaption.caption_image(png_blob)
  end

  def test_keeps_a_caption_exactly_at_the_confidence_floor
    stub_caption('a red circle', ImageCaption::CONFIDENCE_FLOOR)
    assert_equal 'a red circle', ImageCaption.caption_image(png_blob)
  end

  def test_drops_a_caption_below_the_confidence_floor
    # A guess Azure does not stand behind is worse than silence.
    stub_caption('a clock', ImageCaption::CONFIDENCE_FLOOR - 0.01)
    assert_nil ImageCaption.caption_image(png_blob)
  end

  def test_drops_a_result_it_cannot_trust
    [
      nil,
      {'text' => 'a red circle', 'confidence' => nil},
      {'text' => '   ', 'confidence' => 0.9},
      {'confidence' => 0.9},
    ].each do |result|
      stub_result(result)
      assert_nil ImageCaption.caption_image(png_blob), "accepted #{result.inspect}"
    end
  end

  # --- failing soft ---

  def test_returns_nil_and_reports_when_the_api_key_is_missing
    CDO.stubs(azure_computer_vision_key: nil)
    AzureImageCaption.expects(:new).never
    Honeybadger.expects(:notify).once.with(
      'Azure AI Vision API key is missing',
      context: {endpoint: CDO.azure_computer_vision_endpoint}
    )
    assert_nil ImageCaption.caption_image(png_blob)
  end

  def test_returns_nil_and_reports_when_azure_fails
    captioner = mock
    captioner.stubs(:caption_image).raises(AzureImageCaption::RequestFailed.new('boom'))
    AzureImageCaption.stubs(:new).returns(captioner)
    Honeybadger.expects(:notify).once
    # The student keeps theater's description; a missing caption is not an error.
    assert_nil ImageCaption.caption_image(png_blob)
  end

  # --- what it will send ---

  def test_rejects_bytes_that_are_not_a_supported_image
    AzureImageCaption.expects(:new).never
    assert_nil ImageCaption.caption_image('this is not an image')
  end

  def test_rejects_an_image_over_the_size_ceiling
    AzureImageCaption.expects(:new).never
    oversized = png_blob + ('x' * ImageCaption::MAX_IMAGE_SIZE)
    assert_nil ImageCaption.caption_image(oversized)
  end

  # --- caching ---

  def test_an_identical_image_is_captioned_once
    stub_caption('a red circle', 0.81)
    blob = png_blob
    assert_equal 'a red circle', ImageCaption.caption_image(blob)

    # The second run of an unchanged program must not reach Azure again.
    AzureImageCaption.expects(:new).never
    assert_equal 'a red circle', ImageCaption.caption_image(blob)
  end

  def test_a_different_image_gets_a_different_cache_key
    refute_equal(
      ImageCaption.cache_key(png_blob),
      ImageCaption.cache_key(png_blob(200))
    )
  end

  def test_a_low_confidence_result_is_cached_but_not_read_out
    # Asking again would cost the same and get the same answer.
    stub_caption('a clock', ImageCaption::CONFIDENCE_FLOOR - 0.01)
    blob = png_blob
    assert_nil ImageCaption.caption_image(blob)
    assert_equal 'a clock', @cache.read(ImageCaption.cache_key(blob))['text']
  end

  def test_the_floor_is_applied_to_cache_hits
    # An old caption stops being read out as soon as the floor moves.
    stub_caption('a clock', 0.5)
    blob = png_blob
    assert_equal 'a clock', ImageCaption.caption_image(blob)

    AzureImageCaption.expects(:new).never
    ImageCaption.stub_const(:CONFIDENCE_FLOOR, 0.9) do
      assert_nil ImageCaption.caption_image(blob)
    end
  end

  def test_the_cache_key_carries_nothing_but_the_image
    blob = png_blob
    assert_equal(
      "#{ImageCaption::CACHE_KEY_PREFIX}/#{Digest::SHA256.hexdigest(blob)}",
      ImageCaption.cache_key(blob)
    )
  end

  private def stub_caption(text, confidence)
    stub_result({'text' => text, 'confidence' => confidence})
  end

  # Whatever Azure hands back, including nothing.
  private def stub_result(result)
    captioner = mock
    captioner.stubs(:caption_image).returns(result)
    AzureImageCaption.stubs(:new).returns(captioner)
  end

  # Tempfile is unlinked when the block returns (see Tempfile.create).
  private def png_blob(size = 100)
    Tempfile.create(%w[tiny .png]) do |f|
      MiniMagick::Tool::Convert.new do |c|
        c.size "#{size}x#{size}"
        c << 'xc:white'
        c << f.path
      end
      File.binread(f.path)
    end
  end
end
