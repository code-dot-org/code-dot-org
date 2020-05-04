import Walls from './walls';
import {toImageData, URIFromImageData} from '../imageUtils';

const BYTES_PER_PIXEL = 4;
const BITS_PER_BYTE = 8;
const WALL_COLOR = '#7F7F7F';

export default class CollisionMaskWalls extends Walls {
  constructor(
    level,
    skin,
    drawDebugRect,
    drawDebugOverlay,
    width,
    height,
    onload
  ) {
    super(level, skin, drawDebugRect);

    this.width = width;
    this.height = height;
    this.drawDebugOverlay = drawDebugOverlay;
    this.bytesPerRow = Math.ceil(width / BITS_PER_BYTE);
    this.wallMaps = {};
    Promise.all(
      Object.keys(skin.wallMaps).map(mapName => {
        return toImageData(skin.wallMaps[mapName].srcUrl).then(imageData => {
          const wallMap = this.wallMapFromImageData(imageData.data);
          this.wallMaps[mapName] = {
            srcData: imageData,
            wallColor: WALL_COLOR,
            wallMap: wallMap,
            overlayURI: this.wallOverlayURI(imageData, wallMap),
            srcUrl: skin.wallMaps[mapName].srcUrl
          };
        });
      })
    )
      .then(() => {
        if (onload) {
          onload();
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  /**
   * @override
   */
  willRectTouchWall(xCenter, yCenter, collidableWidth, collidableHeight) {
    if (this.wallMaps[this.wallMapRequested]) {
      var wallMap = this.wallMaps[this.wallMapRequested].wallMap;
      this.drawDebugOverlay(this.wallMaps[this.wallMapRequested].srcUrl);

      const yTop = Math.max(0, yCenter - collidableHeight / 2);
      const yBottom = Math.min(this.height, yTop + collidableHeight);
      const xLeft = Math.max(0, xCenter - collidableWidth / 2);
      const xRight = Math.min(this.width, xLeft + collidableWidth);

      // The wallMap has one bit per pixel, stored as long array of bytes that's
      // (height * width / 8) bytes long. Every (width / 8) bytes in the array
      // correspond to a row of pixels in the map.
      // Since the collision box we're checking is a rectangle, we can look at
      // the same few bytes in each row, from the one containg bit xLeft to the
      // one containing bit xRight - 1.
      const firstByteToCheck = Math.floor(xLeft / BITS_PER_BYTE);
      const lastByteToCheck = Math.floor((xRight - 1) / BITS_PER_BYTE);

      for (let y = yTop; y < yBottom; y++) {
        const firstByteInRow = this.bytesPerRow * y;
        for (let x = firstByteToCheck; x <= lastByteToCheck; x++) {
          // First check that there's at least one wall bit in this byte before
          // creating the mask and doing the precise check.
          if (wallMap[firstByteInRow + x]) {
            // Check individual bits, starting from either the first bit in the
            // byte, or the far left of the sprite's collision rect. End with
            // the last bit or the far right of the collision rect.
            const start = Math.max(xLeft, x * BITS_PER_BYTE);
            const end = Math.min(xRight, (x + 1) * BITS_PER_BYTE);

            // Build a series of (end - start) 1's and shift them over by
            // start's offset within the byte.
            const mask = ((1 << (end - start)) - 1) << start % BITS_PER_BYTE;
            if (wallMap[firstByteInRow + x] & mask) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Converts a black and white image representing walls (black) and open space
   * (white) into a byte array with 1 bit per pixel, representing walls (1) or
   * open space (0). There are Math.ceil(width / 8) bytes per row of pixels, so
   * each row starts on a new byte. The least significant bit corresponds to the
   * leftmost of the 8 pixels stored in a byte.
   */
  wallMapFromImageData(data) {
    const arr = new Uint8Array(this.height * this.bytesPerRow);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x += BITS_PER_BYTE) {
        let bits = 0;
        for (let k = 0; k < BITS_PER_BYTE; k++) {
          if (
            x + k < this.width &&
            data[BYTES_PER_PIXEL * (y * this.width + x + k)] === 0
          ) {
            bits = bits | (1 << k);
          }
        }
        arr[y * this.bytesPerRow + x / BITS_PER_BYTE] = bits;
      }
    }
    return arr;
  }

  /**
   * Construct an image data URI from the wallData that shows the walls in a
   * solid color.
   */
  wallOverlayURI(imageData, wallMap, hexColor = WALL_COLOR) {
    const data = imageData.data;
    const color = CollisionMaskWalls.hexToRgb(hexColor);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x += BITS_PER_BYTE) {
        const currentByte = wallMap[y * this.bytesPerRow + x / BITS_PER_BYTE];
        for (let k = 0; k < BITS_PER_BYTE; k++) {
          const map = 1 << k;
          const imageDataIndex = (y * this.width + x + k) * BYTES_PER_PIXEL;
          if (currentByte & map) {
            // Wall pixel, set color
            data[imageDataIndex + 0] = color.R;
            data[imageDataIndex + 1] = color.G;
            data[imageDataIndex + 2] = color.B;
            data[imageDataIndex + 3] = 255;
          } else {
            // Background pixel, set transparent
            data[imageDataIndex + 3] = 0;
          }
        }
      }
    }
    return URIFromImageData(imageData);
  }

  getWallOverlayURI() {
    const wallData = this.wallMaps[this.wallMapRequested];
    return wallData ? wallData.overlayURI : null;
  }

  setColor(color) {
    Object.keys(this.wallMaps).map(mapName => {
      const wallMapData = this.wallMaps[mapName];
      if (wallMapData.wallColor === color) {
        return;
      }
      wallMapData.overlayURI = this.wallOverlayURI(
        wallMapData.srcData,
        wallMapData.wallMap,
        color
      );
      wallMapData.wallColor = color;
    });
  }

  static hexToRgb(hexColor) {
    if (hexColor.length === 4) {
      // short form
      const R = parseInt(hexColor.substr(1, 1), 16) * 0x11;
      const G = parseInt(hexColor.substr(2, 1), 16) * 0x11;
      const B = parseInt(hexColor.substr(3, 1), 16) * 0x11;
      return {R, G, B};
    }

    const R = parseInt(hexColor.substr(1, 2), 16);
    const G = parseInt(hexColor.substr(3, 2), 16);
    const B = parseInt(hexColor.substr(5, 2), 16);
    return {R, G, B};
  }
}
