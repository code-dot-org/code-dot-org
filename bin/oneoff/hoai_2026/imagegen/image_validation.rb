# Validation for generated images, shared by generate_images and
# validate_images.

require 'rmagick'

PNG_SIGNATURE = "\x89PNG\r\n\x1A\n".b

# Returns an error string, or nil when the file is a square PNG and, when
# transparent, has the alpha it should. The published tree is PNG only
# (imageCache.ts). A transparent sprite must have clear corners; a block may
# fill its frame, so it need only carry alpha.
def validate_image(path, image_type: nil, transparent: false)
  return 'missing' unless File.exist?(path)

  header = File.binread(path, PNG_SIGNATURE.bytesize)
  return 'empty' if header.nil? || header.empty?
  return 'not a PNG' unless header == PNG_SIGNATURE

  image = Magick::Image.ping(path).first
  return 'unreadable' if image.nil?
  return "not square (#{image.columns}x#{image.rows})" unless image.columns == image.rows
  return nil unless transparent

  # alpha? needs the pixels, which ping does not read.
  image.destroy!
  image = Magick::Image.read(path).first
  return 'no alpha channel' unless image.alpha?

  if image_type == 'sprite'
    edge = [image.columns - 1, image.rows - 1]
    corners = [[0, 0], [edge[0], 0], [0, edge[1]], edge]
    opaque = corners.count {|x, y| image.pixel_color(x, y).alpha > 0}
    return "#{opaque} of 4 corners not transparent" if opaque > 0
  end

  nil
ensure
  image&.destroy!
end
