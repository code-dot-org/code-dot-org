// A character set is stored as one image: a strip of five frames side by
// side. This module names and groups the frames, cuts one out to draw on,
// and puts the drawn frame back.

import {toImage} from '@cdo/apps/imageUtils';
import {
  AnimationPoses,
  CHARACTER_POSE_TITLES,
  CHARACTER_STRIP_FRAME_COUNT,
  CharacterPose,
  drawStripCell,
  FrameSize,
  orderedPoseKeys,
  PoseKey,
  stripCellOrigin,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

/** What each frame of a generated set shows, in the order the frames
    image holds them (CHARACTER_STRIP_POSES); the only layout a set has. */
export const FRAME_LABELS: readonly string[] = [
  'Idle',
  'Standing',
  'Walk',
  'Jump up',
  'Jump down',
];

/** The frames of one pose, as the row shows them under the pose's name. */
export interface FrameGroup {
  key: PoseKey;
  title: string;
  frames: number[];
}

/** The frames of a set grouped by pose, in pose order. A frame two poses
    share (the standing frame, which ends the idle and starts the walk) is
    listed under the first. Frames past `count` are left out. */
export function frameGroups(
  poses: AnimationPoses,
  count: number
): FrameGroup[] {
  const taken = new Set<number>();
  return orderedPoseKeys(poses).flatMap(key => {
    const range = poses[key]!;
    const [pose, facing] = key.split('-') as [CharacterPose, string];
    const frames: number[] = [];
    for (let i = range.start; i < range.start + range.count; i++) {
      if (i < count && !taken.has(i)) {
        taken.add(i);
        frames.push(i);
      }
    }
    if (!frames.length) {
      return [];
    }
    const title =
      CHARACTER_POSE_TITLES[pose] + (facing === 'left' ? ' left' : '');
    return [{key, title, frames}];
  });
}

/** One frame of the strip as a PNG data URI. */
export async function cutFrame(
  sheetSrc: string,
  frameSize: FrameSize,
  index: number
): Promise<string> {
  const image = await toImage(sheetSrc);
  return drawStripCell(image, frameSize, index).toDataURL('image/png');
}

/** The strip with one frame replaced by drawn pixels, as a PNG data URI.
    The drawn frame is fitted to the cell. */
export async function replaceFrame(
  sheetSrc: string,
  frameSize: FrameSize,
  index: number,
  frameSrc: string
): Promise<string> {
  const [sheet, frame] = await Promise.all([
    toImage(sheetSrc),
    toImage(frameSrc),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = sheet.naturalWidth;
  canvas.height = sheet.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No canvas context');
  }
  ctx.drawImage(sheet, 0, 0);
  const {x, y} = stripCellOrigin(sheet.naturalWidth, frameSize, index);
  ctx.clearRect(x, y, frameSize.x, frameSize.y);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(frame, x, y, frameSize.x, frameSize.y);
  return canvas.toDataURL('image/png');
}

/** How many frames a strip `imageWidth` wide holds, at most the set's
    five. */
export function frameCount(imageWidth: number, frameSize: FrameSize): number {
  return Math.min(
    CHARACTER_STRIP_FRAME_COUNT,
    Math.max(1, Math.floor(imageWidth / frameSize.x))
  );
}
