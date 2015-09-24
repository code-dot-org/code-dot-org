require 'mini_magick'

module ImageLib

# Overlay a foreground and background image as described by params, where
# the background image is resized to 154x154 pixels and centered.
#
# @param [Hash] parameters
# params[:background_blob] - A binary string for the background image.
# params[:background_url]  - A local file path for the background image.
# params[:foreground_blob] - A binary string for the foreground image.
# params[:foreground_url]  - A local file path for the foreground image.
#
# @return [RMagick::ImageList]
def self.overlay_image(params)
    background = read_or_open_image(params[:background_blob], params[:background_url])
    foreground = read_or_open_image(params[:foreground_blob], params[:foreground_url])

    background.combine_options do |c|
      c.gravity = 'center'
      c.geometry = '154x154+0+0'
    end

    drawing_on_background = background.composite(foreground) do |c|
      c.compose "Over" # OverCompositeOp
    end

    drawing_on_background
  end

  private

  def read_or_open_image(blob, url)
    if url.nil?
      MiniMagick::Image.read(blob)
    else
      MiniMagick::Image.open(url)
    end
  end

end
