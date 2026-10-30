require_relative '../test_helper'
require 'cdo/imagemagick_guard'

class ImageMagickGuardTest < Minitest::Test
  # --- actual_content_type ---

  def test_detects_png
    assert_equal 'image/png', ImageMagickGuard.actual_content_type("\x89PNG\r\n\x1a\nrest".b)
  end

  def test_detects_jpeg
    assert_equal 'image/jpeg', ImageMagickGuard.actual_content_type("\xff\xd8\xff\xe0rest".b)
  end

  def test_detects_gif87a
    assert_equal 'image/gif', ImageMagickGuard.actual_content_type("GIF87aXX".b)
  end

  def test_detects_gif89a
    assert_equal 'image/gif', ImageMagickGuard.actual_content_type("GIF89aXX".b)
  end

  def test_detects_webp
    assert_equal 'image/webp', ImageMagickGuard.actual_content_type("RIFF\x00\x00\x00\x00WEBP".b)
  end

  def test_detects_heic
    assert_equal 'image/heic', ImageMagickGuard.actual_content_type("\x00\x00\x00\x18ftypheic".b)
  end

  def test_detects_heif
    assert_equal 'image/heif', ImageMagickGuard.actual_content_type("\x00\x00\x00\x18ftypmif1".b)
  end

  def test_detects_svg_xml
    assert_equal 'image/svg+xml', ImageMagickGuard.actual_content_type("<?xml version=\"1.0\"?><svg></svg>".b)
  end

  def test_detects_svg_no_xml_decl
    assert_equal 'image/svg+xml', ImageMagickGuard.actual_content_type("<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>".b)
  end

  def test_returns_nil_for_arbitrary_text
    assert_nil ImageMagickGuard.actual_content_type("not-an-image".b)
  end

  def test_returns_nil_for_empty_bytes
    assert_nil ImageMagickGuard.actual_content_type("".b)
  end

  def test_detects_riff_wav
    # RIFF container that is WAV audio, not WebP — Marcel recognizes it specifically.
    assert_equal 'audio/x-wav', ImageMagickGuard.actual_content_type("RIFF\x00\x00\x00\x00WAVE".b)
  end

  # --- safe_for_imagemagick? ---

  def test_png_is_safe
    assert ImageMagickGuard.safe_for_imagemagick?("\x89PNG\r\n\x1a\ndata".b)
  end

  def test_jpeg_is_safe
    assert ImageMagickGuard.safe_for_imagemagick?("\xff\xd8\xff\xe0data".b)
  end

  def test_gif_is_safe
    assert ImageMagickGuard.safe_for_imagemagick?("GIF89aXX".b)
  end

  def test_webp_is_safe
    assert ImageMagickGuard.safe_for_imagemagick?("RIFF\x00\x00\x00\x00WEBP".b)
  end

  def test_svg_is_not_safe
    # Marcel identifies SVG correctly; it must still be rejected as unsafe.
    refute ImageMagickGuard.safe_for_imagemagick?("<?xml version=\"1.0\"?><svg></svg>".b)
  end

  def test_heic_is_not_safe
    # Recognized but not in SAFE_TYPES (ImageMagick HEIC support is external/optional)
    refute ImageMagickGuard.safe_for_imagemagick?("\x00\x00\x00\x18ftypheic".b)
  end

  def test_arbitrary_bytes_are_not_safe
    refute ImageMagickGuard.safe_for_imagemagick?("random garbage data".b)
  end

  def test_accepts_non_binary_encoded_string
    # Caller may pass a UTF-8 encoded string; .b coercion must not crash.
    png_header = "\x89PNG\r\n\x1a\n".b + "rest".b
    assert ImageMagickGuard.safe_for_imagemagick?(png_header)
  end
end
