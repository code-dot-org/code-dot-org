// Block markers and field sizes from the GIF89a spec.
const HEADER_LENGTH = 6;
const SCREEN_DESCRIPTOR_LENGTH = 7;
const COLOR_TABLE_FLAG = 0x80;
const COLOR_TABLE_SIZE_MASK = 0x07;
const EXTENSION_INTRODUCER = 0x21;
const GRAPHIC_CONTROL_LABEL = 0xf9;
const IMAGE_DESCRIPTOR = 0x2c;
const TRAILER = 0x3b;
const IMAGE_DESCRIPTOR_LENGTH = 9;
const GRAPHIC_CONTROL_BLOCK_LENGTH = 4;
const MS_PER_CENTISECOND = 10;

// How long an animated gif runs, in milliseconds, or null for bytes this cannot
// read as a gif.
//
// An <img> reports nothing about the animation it is running, so the only way to
// know when a gif is over is to add up the delays the file itself carries. Each
// frame is preceded by a Graphic Control Extension holding its delay as an
// unsigned 16-bit count of centiseconds; every other block is stepped over.
// Theater gifs carry no loop extension, so the sum of the delays is the whole
// animation, once through.
export function gifDurationMs(bytes: Uint8Array): number | null {
  if (
    bytes.length < HEADER_LENGTH + SCREEN_DESCRIPTOR_LENGTH ||
    bytes[0] !== 0x47 || // 'G'
    bytes[1] !== 0x49 || // 'I'
    bytes[2] !== 0x46 // 'F'
  ) {
    return null;
  }

  let position = HEADER_LENGTH + SCREEN_DESCRIPTOR_LENGTH;
  position += colorTableLength(bytes[HEADER_LENGTH + 4]);

  let totalMs = 0;
  while (position < bytes.length) {
    const blockType = bytes[position++];
    if (blockType === TRAILER) {
      return totalMs;
    }
    if (blockType === EXTENSION_INTRODUCER) {
      const label = bytes[position++];
      if (label === GRAPHIC_CONTROL_LABEL) {
        if (bytes[position] !== GRAPHIC_CONTROL_BLOCK_LENGTH) {
          return null;
        }
        // Past the block size and packed fields sits the delay.
        totalMs += readUint16(bytes, position + 2) * MS_PER_CENTISECOND;
      }
      position = skipSubBlocks(bytes, position);
    } else if (blockType === IMAGE_DESCRIPTOR) {
      const packedFields = bytes[position + IMAGE_DESCRIPTOR_LENGTH - 1];
      position += IMAGE_DESCRIPTOR_LENGTH;
      position += colorTableLength(packedFields);
      position += 1; // LZW minimum code size
      position = skipSubBlocks(bytes, position);
    } else {
      // An unknown block leaves no way to find the next one.
      return null;
    }
    if (position < 0) {
      return null;
    }
  }
  // Ran out of bytes without reaching the trailer.
  return null;
}

// Bytes taken by the color table the given packed fields describe, zero when
// there is none.
function colorTableLength(packedFields: number) {
  if (!(packedFields & COLOR_TABLE_FLAG)) {
    return 0;
  }
  return 3 * (1 << ((packedFields & COLOR_TABLE_SIZE_MASK) + 1));
}

// Position just past a chain of length-prefixed sub-blocks, or -1 if the chain
// runs off the end of the file.
function skipSubBlocks(bytes: Uint8Array, start: number) {
  let position = start;
  while (position < bytes.length) {
    const size = bytes[position++];
    if (size === 0) {
      return position;
    }
    position += size;
  }
  return -1;
}

function readUint16(bytes: Uint8Array, position: number) {
  return bytes[position] | (bytes[position + 1] << 8);
}
