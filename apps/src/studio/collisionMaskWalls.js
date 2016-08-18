import Walls from './walls';
import {imageDataFromURI} from '../imageUtils';

const BYTES_PER_PIXEL = 4;
const BITS_PER_BYTE = 8;

export default class CollisionMaskWalls extends Walls {
  constructor(level, skin, drawDebugRect, drawDebugOverlay, width, height, onload) {
    super(level, skin, drawDebugRect);

    this.width = width;
    this.height = height;
    this.drawDebugOverlay = drawDebugOverlay;
    this.bytesPerRow = Math.ceil(width / BITS_PER_BYTE);
    this.wallMaps = {};
    Promise.all(Object.keys(skin.wallMaps).map(mapName => {
      return imageDataFromURI(skin.wallMaps[mapName].srcUrl).then(imageData => {
        this.wallMaps[mapName] = {
          wallMap: this.wallMapFromImageData(imageData),
          srcUrl: skin.wallMaps[mapName].srcUrl
        };
      });
    })).then(() => {
      if (onload) {
        onload();
      }
    }).catch(err => {
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

      const yTop = yCenter - collidableHeight / 2;
      const yBottom = yTop + collidableHeight;
      const xLeft = xCenter - collidableWidth / 2;
      const xRight = xLeft + collidableWidth;
      const firstByteToCheck = Math.floor(xLeft / BITS_PER_BYTE);
      const lastByteToCheck = Math.floor((xRight - 1) / BITS_PER_BYTE);

      for (let y = yTop; y < yBottom; y++) {
        const firstByteInRow = this.bytesPerRow * y;
        for (let x = firstByteToCheck; x <= lastByteToCheck; x++) {
          if (wallMap[firstByteInRow + x]) {
            // Check individual bits, starting from either the first bit in the
            // byte, or the far left of the sprite's collision rect. End with
            // the last bit or the far right of the collision rect.
            const start = Math.max(xLeft, x * BITS_PER_BYTE);
            const end = Math.min(xRight, (x + 1) * BITS_PER_BYTE);
            const mask = ((1 << (end - start)) - 1) << (start % BITS_PER_BYTE);
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
   * open space (0). There are Math.ceil(width/8) bytes per row of pixels, so
   * each row starts on a new byte. The least significant bit corresponds to the
   * leftmost of the 8 pixels stored in a byte.
   */
  wallMapFromImageData(data) {
    const arr = new Uint8Array(this.height * this.bytesPerRow);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x += BITS_PER_BYTE) {
        let bits = 0;
        for (let k = 0; k < BITS_PER_BYTE; k++) {
          if (x + k < this.width &&
              data[BYTES_PER_PIXEL * ((y * this.width) + x + k)] === 0) {
            bits = bits | (1 << k);
          }
        }
        arr[(y * this.bytesPerRow) + (x / BITS_PER_BYTE)] = bits;
      }
    }
    return arr;
  }

}
