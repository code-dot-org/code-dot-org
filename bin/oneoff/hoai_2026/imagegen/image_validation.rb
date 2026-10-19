# Image formats and validation, shared by generate_images and
# validate_images.

require 'rmagick'

# The formats a provider may hand back, by the extension we store them
# under. Gemini returns a JPEG as readily as a PNG, and the lab reads
# whichever it is, so the file is stored as it arrived rather than
# re-encoded: see image_extension.
IMAGE_SIGNATURES = {
  'png' => "\x89PNG\r\n\x1A\n".b,
  'jpg' => "\xFF\xD8\xFF".b,
}.freeze

IMAGE_EXTENSIONS = IMAGE_SIGNATURES.keys.freeze

IMAGE_CONTENT_TYPES = {
  'png' => 'image/png',
  'jpg' => 'image/jpeg',
}.freeze

# Formats that can carry an alpha channel.
TRANSPARENT_FORMATS = %w[png].freeze

# The extension for these bytes, by what they start with, or nil for
# something that is not an image we store. The bytes decide, not the media
# type a response declared: the two have disagreed.
def image_extension(bytes)
  IMAGE_SIGNATURES.find {|_, signature| bytes.b.start_with?(signature)}&.first
end

# Returns an error string, or nil when the file is a square image of a
# format we store and, when transparent, has the alpha it should. A
# transparent sprite must have clear corners; a block may fill its frame, so
# it need only carry alpha.
def validate_image(path, image_type: nil, transparent: false)
  return 'missing' unless File.exist?(path)

  header = File.binread(path, 16)
  return 'empty' if header.nil? || header.empty?

  extension = image_extension(header)
  return "not a #{IMAGE_EXTENSIONS.join(' or ')}" unless extension

  stored = File.extname(path).delete('.')
  return "#{stored} file holding a #{extension}" unless stored == extension

  image = Magick::Image.ping(path).first
  return 'unreadable' if image.nil?
  return "not square (#{image.columns}x#{image.rows})" unless image.columns == image.rows

  return nil unless transparent

  return "#{extension} cannot hold alpha" unless TRANSPARENT_FORMATS.include?(extension)

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
