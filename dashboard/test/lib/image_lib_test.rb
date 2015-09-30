require 'mini_magick'
require 'mini_magick/image'
require 'test_helper'

class ImageLibTest < ActiveSupport::TestCase

  def test_overlay_image
    bg_url =  test_image_path('blank_sharing_drawing_anna.png')
    fg_blob = test_image('foreground_overlay.png').to_blob

    framed_image = ImageLib::overlay_image({
        background_url: bg_url,
        foreground_blob: fg_blob})

    expected_image_name = 'expected_overlaid_image.png'
    expected_image = test_image(expected_image_name)

    matching = images_equal?(framed_image, expected_image)
    if not matching
      # Save the generated image to a file to help with debugger
      tmp_path = '/tmp/framed_image.png'
      framed_image.write(tmp_path)

      puts "Actual image: #{tmp_path}"
      puts "Expected image: #{test_image_path(expected_image_name)}."
      assert false, "Overlaid image did not match expected value"
    end
  end

  # Make sure the images_match helper function is working correctly.
  def test_images_match
    assert images_equal?(test_image('foreground_overlay.png'),
                         test_image('foreground_overlay_copy.png')),
           'Identical images should match'
    assert images_equal?(test_image('foreground_overlay.png'),
                         test_image('foreground_overlay.png')),
           'Image should match itself'
    refute images_equal?(test_image('foreground_overlay.png'),
                         test_image('foreground_overlay_tweaked.png')),
           'Images with same size but different pixels should not match'
    refute images_equal?(test_image('foreground_overlay.png'),
                         test_image('blank_sharing_drawing_anna.png')),
           'Images with different sizes and pixels should not match'
  end

  private

  # Return true if image1 and image2 are identical as determined by
  # the ImageMagic compare tool.
  def images_equal?(image1, image2)
    result = capture_stderr do
      MiniMagick::Tool::Compare.new(false) do |c|
        # Use the absolute error metric, which outputs non-zero to stderr
        # if images don't match.
        c.metric('ae')
        c << image1.path << image2.path << 'null:'
      end
    end
    result.strip!
    puts "Image compare for #{image1.path} and #{image2.path}='#{result}'"
    '0' == result
  end

  # Helper function to evaluate and return output to stderr.
  def capture_stderr
    $stderr = StringIO.new
    yield
    result = $stderr.string
    $stderr = STDERR
    result
  end

  def test_image_path(name)
    Rails.root.join("test/fixtures/#{name}")
  end

  def test_image(name)
    MiniMagick::Image.open(test_image_path(name))
  end

end
