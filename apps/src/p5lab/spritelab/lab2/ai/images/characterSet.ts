// Character sets: the same character drawn standing, walking and jumping,
// facing right and left, each pose delivered as a multi-frame sprite sheet.
//
// The model is asked for ONE frame per request, with the base drawing
// attached as a reference image so the character stays itself; the frames
// are then keyed, cropped and laid into strips here. Asking for a whole
// sheet in one request is not an option: the models do not hold an exact
// frame grid.

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

/** One reference image for a frame: an earlier frame, possibly mirrored. */
export interface FrameReference {
  /** Plan index; always earlier than the frame it is attached to. */
  index: number;
  /**
   * Send the frame flipped left-for-right. The model draws the character
   * the way its references face whatever the text says — a first run came
   * back facing right throughout — so a left-facing frame is drawn from
   * mirrored right-facing ones: every reference it sees faces left.
   */
  mirrored: boolean;
}

/** One frame to ask for. */
export interface FramePlan {
  pose: CharacterPose;
  facing: CharacterFacing;
  frame: number;
  /**
   * References in order: the base drawing, then (left-facing only) this
   * same frame facing right, both mirrored. Never the frame before: the
   * model copies a reference's pose along with its design, and a walk
   * cycle built frame-from-frame came back as near-identical drawings.
   */
  references: FrameReference[];
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
        const references: FrameReference[] = [];
        const add = (index: number, mirrored: boolean) => {
          if (index >= 0 && !references.some(r => r.index === index)) {
            references.push({index, mirrored});
          }
        };
        const flip = facing === 'left';
        if (plan.length > 0) {
          add(0, flip);
        }
        if (flip) {
          add(indexOf(pose, 'right', frame), true);
        }
        plan.push({pose, facing, frame, references});
      }
    });
  });
  return plan;
}

/** How many pictures a set costs; the dialog quotes it. */
export const CHARACTER_SET_FRAME_COUNT = planCharacterFrames().length;

// What each frame shows, per pose, indexed by frame. Lengths match
// CHARACTER_POSES (checked by the unit tests). The walk is the classic
// eight-key side-view cycle — contact, down, passing, up, then the same
// with the legs swapped — spelled out limb by limb, because a looser
// description came back as copies of the standing pose.
const WALK_HALF_CYCLE = (front: string, back: string) => [
  `walking in side view, at the contact point of a long stride: the ${front} leg stretched far forward with its heel on the ground, the ${back} leg stretched far behind with only its toe down, the legs wide apart; the ${back} arm swung forward and the ${front} arm swung back`,
  `walking in side view, just after contact: the ${front} foot flat on the ground taking the weight, the ${front} knee bent, the ${back} foot lifting off behind, the body at its lowest point of the stride`,
  `walking in side view, at the passing point: the ${front} leg planted straight under the body, the ${back} leg lifted and swinging forward past it with a bent knee, the feet close together`,
  `walking in side view, just before the next contact: the ${front} leg straight and pushing off from the toe behind the body, the ${back} leg swinging forward and reaching out in front, the body at its highest point of the stride`,
];
export const POSE_FRAME_DESCRIPTIONS: Record<CharacterPose, string[]> = {
  stand: [
    'standing still, relaxed, at rest',
    'standing still in the same spot, mid-breath: the same pose with the chest and shoulders raised very slightly, as the second frame of an idle animation',
  ],
  walk: [...WALK_HALF_CYCLE('near', 'far'), ...WALK_HALF_CYCLE('far', 'near')],
  jump: [
    'jumping: rising through the air, arms up, legs bent and tucked',
    'falling after a jump: arms out for balance, legs reaching down toward a landing',
  ],
};

function facingClause(facing: CharacterFacing): string {
  return `The character faces ${facing}, exactly as in the provided images: its face and body point toward the ${facing} side of the image.`;
}

/** The prompt for the base drawing: the character standing, facing right. */
export function basePrompt(prompt: string, style: ImageStyle): string {
  return (
    `${prompt}. Show the whole character, ${POSE_FRAME_DESCRIPTIONS.stand[0]}. ` +
    'The character faces right: its face and body point toward the right ' +
    'side of the image. Feet near the bottom of the image, nothing cut off. ' +
    `${styleClause(style)} ${SPRITE_PROMPT_CLAUSE}`
  );
}

/**
 * The prompt for one further frame, drawn from its reference images. The
 * references show the character's design; the text has to insist that the
 * pose is new, or the model hands the reference pose back.
 */
export function framePrompt(
  prompt: string,
  plan: FramePlan,
  style: ImageStyle
): string {
  const references =
    plan.references.length <= 1
      ? 'The provided image shows this character.'
      : 'The provided images show this character.';
  return (
    `The character: ${prompt}. ${references} Draw the same character — same ` +
    'design, colors, proportions, outfit and art style, the same scale — in a ' +
    `NEW pose that clearly differs from the provided images: ${
      POSE_FRAME_DESCRIPTIONS[plan.pose][plan.frame]
    }. ${facingClause(plan.facing)} Keep the same plain flat background ` +
    `color, extending to all edges, with no scenery or ground. ${styleClause(
      style
    )}`
  );
}

/** A data URI of the image flipped left-for-right. */
export async function mirrorDataURI(dataURI: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataURI;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
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
// minute and a set is CHARACTER_SET_FRAME_COUNT, so a transient failure
// gets one more try after a breath rather than a burst.
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
 * order, since each is drawn from ones before it.
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
    const references = await Promise.all(
      step.references.map(({index, mirrored}) => {
        const uri = bytesToDataURI(
          raws[index].uint8Array,
          raws[index].mediaType
        );
        return mirrored ? mirrorDataURI(uri) : uri;
      })
    );
    raws.push(
      await requestFrameWithRetry(text, {
        seed,
        temperature: options.temperature,
        references,
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
