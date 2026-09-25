# Validation for generated images, shared by generate_images and
# validate_images.

require 'rmagick'

PNG_SIGNATURE = "\x89PNG\r\n\x1A\n".b

# Returns an error string, or nil when the file is a square PNG and, when
# transparent, has the alpha it should. A transparent sprite must have clear
# corners; a block may fill its frame, so it need only carry alpha.
def validate_image(path, image_type: nil, transparent: false)
  return 'missing' unless File.exist?(path)

  header = File.binread(path, 24)
  return 'empty' if header.nil? || header.empty?
  return 'not a PNG' unless header.start_with?(PNG_SIGNATURE)
  return 'truncated header' if header.bytesize < 24

  # The IHDR chunk always comes first: width and height are its first fields.
  width, height = header.byteslice(16, 8).unpack('NN')
  return "not square (#{width}x#{height})" unless width == height

  return nil unless transparent

  image = Magick::Image.read(path).first
  return 'no alpha channel' unless image.alpha?

  if image_type == 'sprite'
    corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]]
    opaque = corners.count {|x, y| image.pixel_color(x, y).alpha > 0}
    return "#{opaque} of 4 corners not transparent" if opaque > 0
  end

  nil
ensure
  image&.destroy!
end
