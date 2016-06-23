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
  # @throws MiniMagic::Invalid if the image is invalid.
  # @throws MiniMagic::Error if a MiniMagic error occurs.

  def self.overlay_image(params)
    background, bg_temp = get_image_and_file(
      params[:background_url],
      params[:background_blob]
    )
    foreground, fg_temp = get_image_and_file(
      params[:foreground_url],
      params[:foreground_blob]
    )
    background.geometry('154x154+0+0')
    background.composite(foreground) do |c|
      c.gravity('Center')
      c.compose('Over')
    end
  ensure
    bg_temp.unlink if bg_temp
    fg_temp.unlink if fg_temp
  end

  def self.to_png(image_blob)
    magick_image = MiniMagick::Image.read(image_blob)
    return image_blob if magick_image.info(:format) == 'PNG'

    magick_image.format('png')
    magick_image.to_blob
  end

  # If path is provided, open it as a Minimagic Image and return [image, nil]
  # Otherwise create a temporary file containing the blob, open it as an image
  # and return [image, temp_file].
  def self.get_image_and_file(path, blob)
    if path
      [MiniMagick::Image.open(path), nil]
    else
      # We have to write to a tempfile to work around a bug in Ruby 2.0
      # StringIO as called from MiniMagick::Image.read. This can be changed to
      # Image.read when we update to Ruby 2.2.
      temp_file = Tempfile.new(['blob_file', '.png'], :encoding => 'BINARY')
      temp_file.write(blob)
      temp_file.close
      [MiniMagick::Image.new(temp_file.path), temp_file]
    end
  end
end
