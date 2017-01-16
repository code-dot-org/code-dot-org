#
# Utility functions for reading PNG files
#
module PngUtils
  # Given the complete body of a PNG file, returns hash of source dimensions:
  # {"x": _, "y": _}
  def dimensions_from_png(png_body)
    # Read the first eight bytes of the IHDR Chunk, which must always be the
    # first chunk of the PNG file.
    #
    # PNG Header takes 8 bytes (0x00-0x07)
    # IHDR chunk length takes 4 bytes (0x08-0x0b)
    # IHDR chunk type code takes 4 bytes (0x0c-0x0f)
    # IHDR chunk data begins at 0x10
    #
    # The IHDR chunk begins with
    # 4 bytes for width (0x10-0x13) followed by
    # 4 bytes for height (0x14-0x17)
    #
    # PNG File Structure
    # http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html
    # IHDR Chunk Layout
    # http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html#C.IHDR
    dimensions = png_body[0x10..0x18].unpack('NN')
    {'x': dimensions[0], 'y': dimensions[1]}
  end
  module_function :dimensions_from_png
end
