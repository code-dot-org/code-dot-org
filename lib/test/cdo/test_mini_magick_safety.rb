require_relative '../test_helper'
require 'mini_magick'
require 'cdo/imagemagick_guard'

ImageMagickGuard.patch_mini_magick!

class MiniMagickSafetyTest < Minitest::Test
  def test_rejects_svg_disguised_as_png
    svg = <<~SVG.b
      <?xml version="1.0"?>
      <svg xmlns="http://www.w3.org/2000/svg">
        <image href="text:/etc/passwd"/>
      </svg>
    SVG
    err = assert_raises(MiniMagick::Invalid) {MiniMagick::Image.read(svg, '.png')}
    assert_match(/magic bytes/, err.message)
  end

  def test_rejects_svg_passed_as_io
    svg = StringIO.new("<?xml version=\"1.0\"?><svg></svg>".b)
    assert_raises(MiniMagick::Invalid) {MiniMagick::Image.read(svg)}
  end

  def test_rejects_arbitrary_text
    assert_raises(MiniMagick::Invalid) {MiniMagick::Image.read("not-an-image".b)}
  end

  def test_rejects_extension_mismatch_jpeg_as_png
    jpeg_magic = "\xff\xd8\xff\xe0".b + ("x" * 100).b
    err = assert_raises(MiniMagick::Invalid) {MiniMagick::Image.read(jpeg_magic, '.png')}
    assert_match(/does not match file extension/, err.message)
  end

  def test_rejects_extension_mismatch_png_as_jpg
    png_magic = "\x89PNG\r\n\x1a\n".b + ("x" * 100).b
    err = assert_raises(MiniMagick::Invalid) {MiniMagick::Image.read(png_magic, '.jpg')}
    assert_match(/does not match file extension/, err.message)
  end

  def test_accepts_matching_extension_png
    # Only check the guard; pass real PNG bytes so ImageMagick doesn't choke.
    blob = real_png_blob
    img = MiniMagick::Image.read(blob, '.png')
    assert_equal 'PNG', img.type
  end

  def test_accepts_matching_extension_jpeg
    blob = real_jpeg_blob
    img = MiniMagick::Image.read(blob, '.jpg')
    assert_equal 'JPEG', img.type
  end

  def test_accepts_nil_extension_with_valid_png
    img = MiniMagick::Image.read(real_png_blob)
    assert_equal 'PNG', img.type
  end

  def test_accepts_unknown_extension_skips_extension_check
    # .bmp is not in EXTENSION_TYPES; magic-byte check still applies.
    # Pass actual PNG bytes — safe type passes, unknown ext is ignored.
    img = MiniMagick::Image.read(real_png_blob, '.bmp')
    assert_equal 'PNG', img.type
  end

  def test_accepts_valid_png
    blob = real_png_blob
    img = MiniMagick::Image.read(blob)
    assert_equal 'PNG', img.type
  end

  def test_accepts_valid_png_as_io
    blob = real_png_blob
    img = MiniMagick::Image.read(StringIO.new(blob))
    assert_equal 'PNG', img.type
  end

  # Verify that IO is consumed correctly: read twice on same StringIO should
  # raise on the second call (exhausted), but two separate calls with fresh
  # StringIO objects each succeed.
  def test_two_reads_with_fresh_io_each_succeed
    2.times do
      img = MiniMagick::Image.read(StringIO.new(real_png_blob))
      assert_equal 'PNG', img.type
    end
  end

  private def real_jpeg_blob
    Tempfile.create(%w[test .jpg]) do |f|
      MiniMagick::Tool::Convert.new do |c|
        c.size '10x10'
        c << 'xc:white'
        c << f.path
      end
      File.binread(f.path)
    end
  end

  private def real_png_blob
    Tempfile.create(%w[test .png]) do |f|
      MiniMagick::Tool::Convert.new do |c|
        c.size '10x10'
        c << 'xc:white'
        c << f.path
      end
      File.binread(f.path)
    end
  end
end
