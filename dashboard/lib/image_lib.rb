require 'mini_magick'
require 'mini_magick/image'

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
  # @return [String] The new image as a blob.
  #
  # @return MiniMagick::Image
  # @throws MiniMagic::Error if a minimagic error occurs.
  # @throws ArgumentError if neither the _blob or _url parameter is provided
  #         for the foreground and background.
  def self.overlay_image(params)
    background = get_image(params[:background_blob], params[:background_url])
    foreground = get_image(params[:foreground_blob], params[:foreground_url])

    background.geometry('154x154+0+0')

    background.composite(foreground) {|c|
      c.gravity('Center')
      c.compose('Over')
    }
  end

  private

  def self.get_image(blob, path)
    if blob
      MiniMagick::Image.read(blob)
    else
      MiniMagick::Image.open(path)
    end
  end

end
