require 'test_helper'

class ImageLibTest < ActiveSupport::TestCase

  def test_overlay_image
    framed_image = ImageLib::overlay_image(
        background_url:  test_image_path('blank_sharing_drawing_anna.png'),
        foreground_blob: test_image_list('foreground_overlay.png').to_blob)

    expected_image_name = 'expected_overlaid_image.png'
    expected_image = test_image_list(expected_image_name)

    if (expected_image <=> framed_image) != 0
      # Write the incorrect image to a file to the help the developer diagnose.
      failed_image_path = '/tmp/test_overlay_image.png'
      framed_image.write(failed_image_path)

      puts
      puts "Actual image: #{failed_image_path}"
      puts "Expected image: #{test_image_path(expected_image_name)}."
      assert false, "Overlaid image did not match expected value"
    end

  end

  private

  def test_image_path(name)
    Rails.root.join("test/fixtures/#{name}")
  end

  def test_image_list(name)
    Magick::ImageList.new(test_image_path(name))
  end

end
