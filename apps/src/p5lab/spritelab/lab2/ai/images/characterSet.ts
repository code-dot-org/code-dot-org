// Character sets: the same character drawn standing, walking and jumping,
// facing right and left, each pose delivered as a multi-frame sprite sheet.
//
// The model is asked for ONE frame per request, with the base drawing (and
// the frames it should follow on from) attached as reference images so the
// character stays itself; the frames are then keyed, cropped and laid into
// strips here. Asking for a whole sheet in one request is not an option: the
// models do not hold an exact frame grid.

import {createUuid} from '@cdo/apps/utils';

import {
  CHARACTER_FACINGS,
  CHARACTER_POSES,
  CharacterFacing,
  CharacterPose,
  CharacterRole,
} from '../../characterAnimations';
import {findOpaqueBounds} from '../../imageTrim';

import {
  bytesToDataURI,
  GeneratedImageResult,
  keyOutSprite,
  RawImage,
  requestImage,
  SPRITE_PROMPT_CLAUSE,
  styleClause,
} from './imageGeneration';
import {loadImageFromBlob} from './removeBackground';
import {ImageGenerationMetadata, ImageStyle} from './types';

/** One frame to ask for. */
export interface FramePlan {
  pose: CharacterPose;
  facing: CharacterFacing;
  frame: number;
  /**
   * Plan indices of the frames to attach as references, in order: the base
   * drawing, then the same frame facing the other way, then the frame
   * before this one. All are earlier in the plan than this frame.
   */
  references: number[];
}

/**
 * Every frame of a set in generation order — right-facing poses first, so
 * each left-facing frame can be drawn from its right-facing twin. Index 0
 * is the base drawing: standing, facing right.
 */
export function planCharacterFrames(): FramePlan[] {
  const plan: FramePlan[] = [];
  const indexOf = (
    pose: CharacterPose,
    facing: CharacterFacing,
    frame: number
  ) =>
    plan.findIndex(
      p => p.pose === pose && p.facing === facing && p.frame === frame
    );
  CHARACTER_FACINGS.forEach(facing => {
    CHARACTER_POSES.forEach(({pose, frameCount}) => {
      for (let frame = 0; frame < frameCount; frame++) {
        const references: number[] = [];
        const add = (index: number) => {
          if (index >= 0 && !references.includes(index)) {
            references.push(index);
          }
        };
        if (plan.length > 0) {
          add(0);
        }
        if (facing === 'left') {
          add(indexOf(pose, 'right', frame));
        }
        if (frame > 0) {
          add(indexOf(pose, facing, frame - 1));
        }
        plan.push({pose, facing, frame, references});
      }
    });
  });
  return plan;
}

// What each frame shows, per pose, indexed by frame. Lengths match
// CHARACTER_POSES (checked by the unit tests).
export const POSE_FRAME_DESCRIPTIONS: Record<CharacterPose, string[]> = {
  stand: [
    'standing still, relaxed, at rest',
    'standing still in the same spot, mid-breath: the same pose with the chest and shoulders raised very slightly, as the second frame of an idle animation',
  ],
  walk: [
    'walking: one leg forward and the other back, mid-stride, arms swinging',
    'walking: the legs passing each other under the body, the body a little higher',
    'walking: the other leg forward now, mid-stride, the arms swung the other way',
    'walking: the legs passing each other under the body again, the body a little higher',
  ],
  jump: [
    'jumping: rising through the air, arms up, legs bent and tucked',
    'falling after a jump: arms out for balance, legs reaching down toward a landing',
  ],
};

function facingClause(facing: CharacterFacing): string {
  return `The character faces ${facing}: its face and body point toward the ${facing} side of the image.`;
}

/** The prompt for the base drawing: the character standing, facing right. */
export function basePrompt(prompt: string, style: ImageStyle): string {
  return (
    `${prompt}. Show the whole character, ${POSE_FRAME_DESCRIPTIONS.stand[0]}. ` +
    `${facingClause(
      'right'
    )} Feet near the bottom of the image, nothing cut off. ` +
    `${styleClause(style)} ${SPRITE_PROMPT_CLAUSE}`
  );
}

/** The prompt for one further frame, drawn from its reference images. */
export function framePrompt(
  prompt: string,
  plan: FramePlan,
  style: ImageStyle
): string {
  const count = plan.references.length;
  const references =
    count <= 1
      ? 'The provided image shows the character.'
      : `The first provided image shows the character; the ${
          count === 2
            ? 'other image is an earlier frame'
            : 'others are earlier frames'
        } of the same animation, to follow on from.`;
  return (
    `The character: ${prompt}. ${references} Draw exactly the same character — ` +
    'same design, colors, proportions, outfit and art style, the same size in ' +
    `the frame — now ${POSE_FRAME_DESCRIPTIONS[plan.pose][plan.frame]}. ` +
    `${facingClause(plan.facing)} Keep the same plain flat background color, ` +
    `extending to all edges, with no scenery or ground. ${styleClause(style)}`
  );
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * The cell every frame of a set is laid into: as wide and tall as the
 * largest frame, so switching poses never changes the sprite's size. A set
 * with nothing opaque gets a 1x1 cell rather than an empty sheet.
 */
export function cellSize(frames: (Bounds | null)[]): {x: number; y: number} {
  let x = 1;
  let y = 1;
  frames.forEach(bounds => {
    if (bounds) {
      x = Math.max(x, bounds.right - bounds.left + 1);
      y = Math.max(y, bounds.bottom - bounds.top + 1);
    }
  });
  return {x, y};
}

/**
 * Where a frame's content goes on the strip: its cell, centered across and
 * standing on the cell's floor, so feet stay put from frame to frame.
 */
export function frameOffset(
  cell: {x: number; y: number},
  bounds: Bounds,
  index: number
): {x: number; y: number} {
  const width = bounds.right - bounds.left + 1;
  const height = bounds.bottom - bounds.top + 1;
  return {
    x: index * cell.x + Math.floor((cell.x - width) / 2),
    y: cell.y - height,
  };
}

interface KeyedFrame {
  canvas: HTMLCanvasElement;
  bounds: Bounds | null;
}

async function keyFrame(raw: RawImage, style: ImageStyle): Promise<KeyedFrame> {
  const img = await loadImageFromBlob(await keyOutSprite(raw, style));
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {canvas, bounds: findOpaqueBounds(data, canvas.width, canvas.height)};
}

function composeStrip(
  frames: KeyedFrame[],
  cell: {x: number; y: number}
): Promise<Blob> {
  const strip = document.createElement('canvas');
  strip.width = cell.x * frames.length;
  strip.height = cell.y;
  const ctx = strip.getContext('2d')!;
  frames.forEach(({canvas, bounds}, index) => {
    if (!bounds) {
      return;
    }
    const width = bounds.right - bounds.left + 1;
    const height = bounds.bottom - bounds.top + 1;
    const at = frameOffset(cell, bounds, index);
    ctx.drawImage(
      canvas,
      bounds.left,
      bounds.top,
      width,
      height,
      at.x,
      at.y,
      width,
      height
    );
  });
  return new Promise<Blob>((resolve, reject) => {
    strip.toBlob(result => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

// One pause-and-retry per frame. The gateway allows a user 50 requests a
// minute and a set is 16, so a transient failure gets one more try after a
// breath rather than a burst.
const RETRY_DELAY_MS = 4000;

async function requestFrameWithRetry(
  text: string,
  request: Parameters<typeof requestImage>[1]
): Promise<RawImage> {
  try {
    return await requestImage(text, request);
  } catch {
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    return requestImage(text, request);
  }
}

export interface CharacterSetOptions {
  style: ImageStyle;
  temperature?: number;
  seed?: number;
}

export interface CharacterSetProgress {
  /** Frames finished so far, of total. */
  done: number;
  total: number;
  /** What is being drawn now, for the dialog to show. */
  label: string;
}

const POSE_LABELS: Record<CharacterPose, string> = {
  stand: 'standing',
  walk: 'walking',
  jump: 'jumping',
};

export function frameLabel(plan: FramePlan): string {
  const {frameCount} = CHARACTER_POSES.find(p => p.pose === plan.pose)!;
  return `${POSE_LABELS[plan.pose]} ${plan.facing}, frame ${
    plan.frame + 1
  } of ${frameCount}`;
}

/**
 * Generate a character set: one result per pose and facing, the base
 * (standing, right) first, each a horizontal-strip sprite sheet whose
 * frames share one cell size. Frames are requested one at a time, in plan
 * order, since each is drawn from the ones before it.
 *
 * Pixel style is keyed like a single sprite but not grid-normalized: each
 * frame would find its own grid and land at its own scale, and the frames
 * of one strip must agree.
 */
export async function generateCharacterSet(
  prompt: string,
  options: CharacterSetOptions,
  onProgress?: (progress: CharacterSetProgress) => void
): Promise<GeneratedImageResult[]> {
  const plan = planCharacterFrames();
  // One seed for the whole set; recorded on every member.
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const raws: RawImage[] = [];
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    onProgress?.({done: i, total: plan.length, label: frameLabel(step)});
    const text =
      i === 0
        ? basePrompt(prompt, options.style)
        : framePrompt(prompt, step, options.style);
    raws.push(
      await requestFrameWithRetry(text, {
        seed,
        temperature: options.temperature,
        references: step.references.map(index =>
          bytesToDataURI(raws[index].uint8Array, raws[index].mediaType)
        ),
      })
    );
  }
  onProgress?.({done: plan.length, total: plan.length, label: 'assembling'});

  const keyed = await Promise.all(
    raws.map(raw => keyFrame(raw, options.style))
  );
  const cell = cellSize(keyed.map(frame => frame.bounds));
  const id = createUuid();
  const generation: ImageGenerationMetadata = {
    prompt,
    imageType: 'sprite',
    style: options.style,
    seed,
    ...(options.temperature !== undefined && {
      temperature: options.temperature,
    }),
  };

  const results: GeneratedImageResult[] = [];
  for (const facing of CHARACTER_FACINGS) {
    for (const {pose, frameCount, frameDelay, looping} of CHARACTER_POSES) {
      const frames = plan
        .map((step, index) => ({step, index}))
        .filter(({step}) => step.pose === pose && step.facing === facing)
        .sort((a, b) => a.step.frame - b.step.frame)
        .map(({index}) => keyed[index]);
      const blob = await composeStrip(frames, cell);
      const role: CharacterRole = {id, pose, facing};
      results.push({
        filename: `generated-${createUuid()}.png`,
        uint8Array: new Uint8Array(await blob.arrayBuffer()),
        mediaType: 'image/png',
        generation,
        frames: {frameSize: cell, frameCount, frameDelay, looping},
        character: role,
      });
    }
  }
  return results;
}
