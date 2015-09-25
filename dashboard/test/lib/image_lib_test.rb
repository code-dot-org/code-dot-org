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

    ok = images_match(framed_image, expected_image)
    if not ok
      tmp_path = '/tmp/frame_image.png'
      framed_image.write(tmp_path)
      puts "Actual image: #{tmp_path}"
      puts "Expected image: #{test_image_path(expected_image_name)}."
      assert false, "Overlaid image did not match expected value"
    end
  end

  # Make sure the images_match helper function is working correctly.
  def test_images_match
    assert images_match(test_image('foreground_overlay.png'),
                        test_image('foreground_overlay_copy.png'))
    refute images_match(test_image('foreground_overlay.png'),
                        test_image('blank_sharing_drawing_anna.png'))
  end

  private

  # Return true if image1 and image2 are identical
  #
  def images_match(image1, image2)
    0 == MiniMagick::Tool::Compare.new do |compare|
      compare.metric('ae')
      compare << image1.path
      compare << image2.path
    end
  end

  def test_image_path(name)
    Rails.root.join("test/fixtures/#{name}")
  end

  def test_image(name)
    MiniMagick::Image.open(test_image_path(name))
  end

end
