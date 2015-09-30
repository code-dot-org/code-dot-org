# Helper functions for manipulating images.
module ImageLib

  # Overlay a foreground and background image as described by params, where
  # the background image is resized to 154x154 pixels and centered.
  #
  # @param [Hash] parameters
  #   params[:background_blob] - A binary string for the background image.
  #   params[:background_url]  - A local file path for the background image.
  #   params[:foreground_blob] - A binary string for the foreground image.
  #   params[:foreground_url]  - A local file path for the foreground image.
  #
  # @return [RMagick::ImageList]
  def self.overlay_image(params)
    if params[:background_url].nil?
      background = Magick::ImageList.new
      background.from_blob(params[:background_blob])
    else
      background = Magick::ImageList.new(params[:background_url])
    end

    if params[:foreground_url].nil?
      foreground = Magick::ImageList.new
      foreground.from_blob(params[:foreground_blob])
    else
      foreground = Magick::ImageList.new(params[:foreground_url])
    end

    background.gravity = Magick::CenterGravity
    background.geometry = '154x154+0+0'
    drawing_on_background = background.composite_layers(foreground, Magick::OverCompositeOp)
    drawing_on_background.format = 'png'
    drawing_on_background
  end

end
