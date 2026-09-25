# Validation for generated images, shared by generate_images and
# validate_images.

PNG_SIGNATURE = "\x89PNG\r\n\x1A\n".b

# Returns an error string, or nil when the file is a square PNG.
def validate_image(path)
  return 'missing' unless File.exist?(path)

  header = File.binread(path, 24)
  return 'empty' if header.nil? || header.empty?
  return 'not a PNG' unless header.start_with?(PNG_SIGNATURE)
  return 'truncated header' if header.bytesize < 24

  # The IHDR chunk always comes first: width and height are its first fields.
  width, height = header.byteslice(16, 8).unpack('NN')
  return "not square (#{width}x#{height})" unless width == height

  nil
end
