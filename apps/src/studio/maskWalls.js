import Walls from './walls';
import {uriToImageData} from '../imageUtils';

const BYTES_PER_PIXEL = 4;
const BITS_PER_BYTE = 8;

export default class MaskWalls extends Walls {
  constructor(level, skin) {
    super(level, skin);

    this.bytesPerRow = Math.ceil(Studio.MAZE_WIDTH / BITS_PER_BYTE);
    this.wallMapLayers = {};
    for (const mapName in skin.wallMapLayers) {
      uriToImageData(skin.wallMapLayers[mapName].srcUrl).then(imageData => {
        this.wallMapLayers[mapName] = {
          wallMap: this.wallMapFromImageData(imageData),
          srcUrl: skin.wallMapLayers[mapName].srcUrl
        };
      });
    }
  }

  willRectTouchWall(xCenter, yCenter, collidableWidth, collidableHeight) {
    if (this.wallMapLayers[this.wallMapRequested]) {
      var wallMapLayer = this.wallMapLayers[this.wallMapRequested].wallMap;
      // Compare against a layout image

      Studio.drawDebugOverlay(this.wallMapLayers[this.wallMapRequested].srcUrl);

      const yTop = yCenter - collidableHeight / 2;
      const yBottom = yTop + collidableHeight;
      const xLeft = xCenter - collidableWidth / 2;
      const xRight = xLeft + collidableWidth;
      const xStart = Math.floor(xLeft / BITS_PER_BYTE);
      const xEnd = Math.floor((xRight - 1) / BITS_PER_BYTE);

      for (let y = yTop; y < yBottom; y++) {
        const rowStart = this.bytesPerRow * y;
        for (let x = xStart; x <= xEnd; x++) {
          if (wallMapLayer[rowStart + x]) {
            const start = Math.max(xLeft, Math.floor(x * BITS_PER_BYTE));
            const end = Math.min(xRight, Math.floor((x + 1) * BITS_PER_BYTE));
            for (let i = start; i < end; i++) {
              if (wallMapLayer[rowStart + x] & (1 << (i % BITS_PER_BYTE))) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  wallMapFromImageData(data) {
    // Every row starts with a new byte to make some calculations simpler. The
    // default width of 400 fits perfectly into 50 bytes anyway.
    const arr = new Uint8Array(Studio.MAZE_HEIGHT * this.bytesPerRow);
    for (let y = 0; y < Studio.MAZE_HEIGHT; y++) {
      for (let x = 0; x < Studio.MAZE_WIDTH; x += BITS_PER_BYTE) {
        let bits = 0;
        for (let k = 0; k < BITS_PER_BYTE; k++) {
          if (x + k < Studio.MAZE_WIDTH &&
              data[BYTES_PER_PIXEL * ((y * Studio.MAZE_WIDTH) + x + k)] === 0) {
            bits = bits | (1 << k);
          }
        }
        arr[(y * this.bytesPerRow) + (x / BITS_PER_BYTE)] = bits;
      }
    }
    return arr;
  }

}
