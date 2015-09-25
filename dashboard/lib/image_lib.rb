require 'mini_magick'
require 'mini_magick/image'

module ImageLib

  # Overlay a foreground and background image as described by opts, where
  # the background image is resized to 154x154 pixels and centered.
  #
  # @param [Hash] parameters
  #   opts[:background_blob] - A binary string for the background image.
  #   opts[:background_url]  - A local file path for the background image.
  #   opts[:foreground_blob] - A binary string for the foreground image.
  #   opts[:foreground_url]  - A local file path for the foreground image.
  #
  # @return [String] The new image as a blob.
  #
  # @return MiniMagick::Image
  # @throws MiniMagic::Error if a minimagic error occurs.
  # @throws ArgumentError if neither the _blob or _url parameter is provided
  #         for the foreground and background.
  def self.overlay_image(opts)
    background = get_image(opts[:background_blob], opts[:background_url])
    foreground = get_image(opts[:foreground_blob], opts[:foreground_url])

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
