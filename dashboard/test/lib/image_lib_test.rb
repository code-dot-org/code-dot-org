require 'mini_magick'
require 'mini_magick/image'
require 'test_helper'

class ImageLibTest < ActiveSupport::TestCase

  def test_overlay_image
    fg_blob = test_image('foreground_overlay.png').to_blob
    bg_url = test_image_path('blank_sharing_drawing_anna.png')

    framed_image = ImageLib::overlay_image({
        background_url: bg_url, foreground_blob: fg_blob})

    expected_image_name = 'expected_overlaid_image.png'
    expected_image_path = test_image_path(expected_image_name)
    expected_image = test_image(expected_image_name)

    date = Time.now.strftime("%Y-%m-%d-%H%M%S")
    generated_image_path = "/tmp/generated_image_#{date}.png"

    File.open(generated_image_path, 'w') do |file|
      file.write(framed_image)
    end

    diff = MiniMagick::Tool::Compare.new do |compare|
      compare.metric('ae')
      compare << expected_image_path
      compare << generated_image_path
    end

    puts "Actual image: #{generated_image_path}"
    puts "Expected image: #{expected_image_path}."

    assert diff == 0, "Overlaid image did not match expected value"
  end

  private

  def test_image_path(name)
    Rails.root.join("test/fixtures/#{name}")
  end

  def test_image(name)
    MiniMagick::Image.open(test_image_path(name))
  end

end
