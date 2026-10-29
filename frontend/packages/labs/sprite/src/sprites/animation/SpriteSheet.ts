import type p5 from 'p5';

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
  name?: unknown;
}

export interface FrameRecord {
  name: unknown;
  frame: FrameRect;
}

/** A source image cut into frames (ANI-1..ANI-4). */
export class SpriteSheet {
  image: p5.Image;
  frames: FrameRecord[];
  frame_width: number;
  frame_height: number;
  num_frames: number;

  constructor(
    image: p5.Image,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
  );
  constructor(image: p5.Image, frames: FrameRecord[]);
  constructor(
    image: p5.Image,
    framesOrWidth: number | FrameRecord[],
    frameHeight?: number,
    frameCount?: number,
  ) {
    this.image = image;
    if (Array.isArray(framesOrWidth)) {
      this.frames = framesOrWidth.slice();
      this.frame_width = 0;
      this.frame_height = 0;
      this.num_frames = this.frames.length;
    } else {
      this.frame_width = framesOrWidth;
      this.frame_height = frameHeight as number;
      this.num_frames = frameCount as number;
      this.frames = gridFrames(
        image,
        this.frame_width,
        this.frame_height,
        this.num_frames,
      );
    }
  }

  clone(): SpriteSheet {
    const copy = Object.create(SpriteSheet.prototype) as SpriteSheet;
    copy.image = this.image;
    copy.frame_width = this.frame_width;
    copy.frame_height = this.frame_height;
    copy.num_frames = this.num_frames;
    // ANI-4: the name comes from the rectangle, which normally has none.
    copy.frames = this.frames.map(record => ({
      name: record.frame.name,
      frame: {
        x: record.frame.x,
        y: record.frame.y,
        width: record.frame.width,
        height: record.frame.height,
      },
    }));
    return copy;
  }
}

function gridFrames(
  image: p5.Image,
  frameWidth: number,
  frameHeight: number,
  frameCount: number,
): FrameRecord[] {
  const frames: FrameRecord[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < frameCount; i++) {
    frames.push({
      name: i,
      frame: {x, y, width: frameWidth, height: frameHeight},
    });
    x += frameWidth;
    if (x >= image.width) {
      x = 0;
      y += frameHeight;
      if (y >= image.height) {
        y = 0;
      }
    }
  }
  return frames;
}
