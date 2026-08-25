// Character sets: the same character drawn standing, walking and jumping,
// facing right and left, delivered as ONE sprite sheet with a named frame
// range per pose (characterAnimations.ts).
//
// The model is asked for ONE frame per request, with the base drawing
// attached as a reference image so the character stays itself, all on a
// key colour we name (keyColor.ts); the frames are then keyed, cropped and
// laid into a grid here. Asking for a whole
// sheet in one request is not an option: the models do not hold an exact
// frame grid.

import {createUuid} from '@cdo/apps/utils';

import {
  AnimationPoses,
  CHARACTER_FACINGS,
  CHARACTER_POSES,
  CharacterFacing,
  CharacterPose,
  poseKey,
} from '../../characterAnimations';
import {findOpaqueBounds} from '../../imageTrim';

import {
  bytesToDataURI,
  GeneratedImageResult,
  RawImage,
  rawImageToBlob,
  requestImage,
  styleClause,
} from './imageGeneration';
import {chooseKeyColor, KeyColor} from './keyColor';
import {CHARACTER_SET_IMAGE_SIZE} from './modelHelpers';
import {poseFigureDataURI} from './poseFigures';
import {loadImageFromBlob, removeKeyColor} from './removeBackground';
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
  /**
   * Attach the stick figure for this pose (poseFigures.ts) as the last
   * reference. Every frame but the base, which sets the design and needs
   * no pose beyond "standing".
   */
  poseFigure: boolean;
}

/**
 * Every frame of a set in generation order — which is also its order in
 * the sheet: right-facing poses first, so each left-facing frame can be
 * drawn from its right-facing twin. Index 0 is the base drawing: standing,
 * facing right. Each pose's frames are contiguous and in frame order.
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
        plan.push({
          pose,
          facing,
          frame,
          references,
          poseFigure: plan.length > 0,
        });
      }
    });
  });
  return plan;
}

/** How many pictures a set costs; the dialog quotes it. */
export const CHARACTER_SET_FRAME_COUNT = planCharacterFrames().length;

/** The pose ranges of a sheet laid out in plan order. */
export function buildPoses(plan: FramePlan[]): AnimationPoses {
  const poses: AnimationPoses = {};
  plan.forEach((step, index) => {
    const key = poseKey(step.pose, step.facing);
    const spec = CHARACTER_POSES.find(p => p.pose === step.pose)!;
    const range = poses[key];
    if (!range) {
      poses[key] = {start: index, count: 1, frameDelay: spec.frameDelay};
    } else {
      range.count++;
    }
  });
  return poses;
}

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
    'standing still, relaxed, at rest, arms hanging loosely at the sides with the hands empty and apart',
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

// Each frame is drawn on its own, so a companion or prop the model adds to
// one frame has no reason to recur in the next: a cat came and went across
// a witch's walk. Say so in every frame's prompt.
const ONLY_THIS_CHARACTER =
  'Only this one character, alone: no other creatures, people, pets, objects or companions, and nothing added that is not part of the character itself.';

/** The one flat colour every frame is drawn on, keyed out afterwards. */
function keyClause(key: KeyColor): string {
  return `Use a plain, solid, flat background of exactly one color, ${key.name} (${key.hex}), filling the image to every edge — no gradient, no scenery, no ground, and no shadow under the character. Only the character on that flat ${key.name}.`;
}

/** The prompt for the base drawing: the character standing, facing right. */
export function basePrompt(
  prompt: string,
  style: ImageStyle,
  key: KeyColor
): string {
  return (
    `${prompt}. Show the whole character, ${POSE_FRAME_DESCRIPTIONS.stand[0]}. ` +
    'The character faces right: its face and body point toward the right ' +
    'side of the image. Feet near the bottom of the image, nothing cut off. ' +
    `${ONLY_THIS_CHARACTER} ${styleClause(style)} ${keyClause(key)}`
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
  style: ImageStyle,
  key: KeyColor
): string {
  const characterImages =
    plan.references.length <= 1
      ? 'The first provided image shows this character.'
      : `The first ${plan.references.length} provided images show this character.`;
  const figure = plan.poseFigure
    ? ' The last provided image is a stick figure showing the exact pose to draw: match its body position precisely — where each leg, foot, arm and the torso are, and how far apart the feet stand — while drawing the character with its own design, not the stick figure.'
    : '';
  return (
    `The character: ${prompt}. ${characterImages}${figure} Draw the same ` +
    'character — same design, colors, proportions, outfit and art style, the ' +
    `same scale — in this pose: ${
      POSE_FRAME_DESCRIPTIONS[plan.pose][plan.frame]
    }. ${facingClause(plan.facing)} ${ONLY_THIS_CHARACTER} ${keyClause(
      key
    )} ${styleClause(style)}`
  );
}

/** A data URI of the image flipped left-for-right. */
export async function mirrorDataURI(dataURI: string): Promise<string> {
  const img = await loadDataURI(dataURI);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

function loadDataURI(dataURI: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataURI;
  });
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * The cell every frame of a set is laid into, before scaling: as wide and
 * tall as the largest frame, so switching poses never changes the sprite's
 * size. A set with nothing opaque gets a 1x1 cell rather than an empty
 * sheet.
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

/** A sheet's grid: cells of one size, row by row, wrapping at `columns`. */
export interface SheetLayout {
  columns: number;
  rows: number;
  /** Content scale applied to every frame, 1 or less. */
  scale: number;
  /** The cell after scaling. */
  cell: {x: number; y: number};
  width: number;
  height: number;
}

// The sheet's pixel budget. The asset store shrinks any upload of 5MB or
// more to a quarter size, which silently breaks the frame grid, and a
// painterly frame costs about a byte a pixel as PNG. Three million pixels
// keeps a set of 24 frames near a 360px-tall cell: plenty for sprites drawn
// at a tenth of that, even zoomed three times.
export const MAX_SHEET_PIXELS = 3_000_000;
// If a sheet still encodes larger than this, it is re-laid smaller.
export const MAX_SHEET_BYTES = 4_000_000;

/**
 * Lay `count` cells of `cell` into a near-square grid, scaled down as one
 * so the sheet stays within `maxPixels`. Near-square, not a strip: a strip
 * of 24 model-sized frames is wider than some canvases allow.
 */
export function sheetLayout(
  count: number,
  cell: {x: number; y: number},
  maxPixels: number = MAX_SHEET_PIXELS
): SheetLayout {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const full = columns * rows * cell.x * cell.y;
  const scale = Math.min(1, Math.sqrt(maxPixels / full));
  const scaled = {
    x: Math.max(1, Math.floor(cell.x * scale)),
    y: Math.max(1, Math.floor(cell.y * scale)),
  };
  return {
    columns,
    rows,
    scale,
    cell: scaled,
    width: columns * scaled.x,
    height: rows * scaled.y,
  };
}

/**
 * Where a frame's (already scaled) content goes on the sheet: its cell,
 * centered across and standing on the cell's floor, so feet stay put from
 * frame to frame.
 */
export function placeFrame(
  layout: SheetLayout,
  index: number,
  width: number,
  height: number
): {x: number; y: number} {
  const column = index % layout.columns;
  const row = Math.floor(index / layout.columns);
  return {
    x: column * layout.cell.x + Math.floor((layout.cell.x - width) / 2),
    y: row * layout.cell.y + (layout.cell.y - height),
  };
}

interface KeyedFrame {
  canvas: HTMLCanvasElement;
  bounds: Bounds | null;
}

// Content is what is at least half opaque: a faint fringe or a ghost of a
// shadow under the feet must not set where the feet stand.
const SOLID_ALPHA = 127;

async function keyFrame(
  raw: RawImage,
  style: ImageStyle,
  key: KeyColor
): Promise<KeyedFrame> {
  const blob = await removeKeyColor(rawImageToBlob(raw), key.rgb, {
    soft: style === 'smooth',
  });
  const img = await loadImageFromBlob(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {
    canvas,
    bounds: findOpaqueBounds(data, canvas.width, canvas.height, SOLID_ALPHA),
  };
}

/** The keyed frame cropped to its content, as a data URI for the preview. */
function framePreview({canvas, bounds}: KeyedFrame): string | undefined {
  if (!bounds) {
    return undefined;
  }
  const width = bounds.right - bounds.left + 1;
  const height = bounds.bottom - bounds.top + 1;
  const crop = document.createElement('canvas');
  crop.width = width;
  crop.height = height;
  crop
    .getContext('2d')!
    .drawImage(
      canvas,
      bounds.left,
      bounds.top,
      width,
      height,
      0,
      0,
      width,
      height
    );
  return crop.toDataURL('image/png');
}

function composeSheet(
  frames: KeyedFrame[],
  layout: SheetLayout
): Promise<Blob> {
  const sheet = document.createElement('canvas');
  sheet.width = layout.width;
  sheet.height = layout.height;
  const ctx = sheet.getContext('2d')!;
  frames.forEach(({canvas, bounds}, index) => {
    if (!bounds) {
      return;
    }
    const width = bounds.right - bounds.left + 1;
    const height = bounds.bottom - bounds.top + 1;
    const scaledW = Math.max(1, Math.round(width * layout.scale));
    const scaledH = Math.max(1, Math.round(height * layout.scale));
    const at = placeFrame(layout, index, scaledW, scaledH);
    ctx.drawImage(
      canvas,
      bounds.left,
      bounds.top,
      width,
      height,
      at.x,
      at.y,
      scaledW,
      scaledH
    );
  });
  return new Promise<Blob>((resolve, reject) => {
    sheet.toBlob(result => {
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
  /** The last frame finished, keyed and cropped, for the dialog to show. */
  preview?: string;
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
 * Generate a character set as one sprite-sheet result: every pose's frames
 * in one grid, with `frames.poses` naming each range. Frames are requested
 * one at a time, in plan order, since each is drawn from ones before it.
 *
 * Pixel style is keyed like a single sprite but not grid-normalized: each
 * frame would find its own grid and land at its own scale, and the frames
 * of one sheet must agree.
 */
export async function generateCharacterSet(
  prompt: string,
  options: CharacterSetOptions,
  onProgress?: (progress: CharacterSetProgress) => void
): Promise<GeneratedImageResult> {
  const plan = planCharacterFrames();
  const key = chooseKeyColor(prompt);
  // One seed for the whole set.
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const raws: RawImage[] = [];
  const keyed: KeyedFrame[] = [];
  let preview: string | undefined;
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    onProgress?.({
      done: i,
      total: plan.length,
      label: frameLabel(step),
      preview,
    });
    const text =
      i === 0
        ? basePrompt(prompt, options.style, key)
        : framePrompt(prompt, step, options.style, key);
    const references = await Promise.all(
      step.references.map(({index, mirrored}) => {
        const uri = bytesToDataURI(
          raws[index].uint8Array,
          raws[index].mediaType
        );
        return mirrored ? mirrorDataURI(uri) : uri;
      })
    );
    if (step.poseFigure) {
      references.push(
        await poseFigureDataURI(step.pose, step.frame, step.facing)
      );
    }
    const raw = await requestFrameWithRetry(text, {
      seed,
      temperature: options.temperature,
      references,
      imageSize: CHARACTER_SET_IMAGE_SIZE,
    });
    raws.push(raw);
    const frame = await keyFrame(raw, options.style, key);
    keyed.push(frame);
    preview = framePreview(frame) || preview;
  }
  onProgress?.({
    done: plan.length,
    total: plan.length,
    label: 'assembling',
    preview,
  });

  const cell = cellSize(keyed.map(frame => frame.bounds));
  let maxPixels = MAX_SHEET_PIXELS;
  let layout = sheetLayout(keyed.length, cell, maxPixels);
  let blob = await composeSheet(keyed, layout);
  // A very detailed sheet can still encode too large; re-lay it smaller.
  for (let attempt = 0; blob.size > MAX_SHEET_BYTES && attempt < 3; attempt++) {
    maxPixels *= 0.6;
    layout = sheetLayout(keyed.length, cell, maxPixels);
    blob = await composeSheet(keyed, layout);
  }

  const generation: ImageGenerationMetadata = {
    prompt,
    imageType: 'sprite',
    style: options.style,
    seed,
    ...(options.temperature !== undefined && {
      temperature: options.temperature,
    }),
  };
  return {
    filename: `generated-${createUuid()}.png`,
    uint8Array: new Uint8Array(await blob.arrayBuffer()),
    mediaType: 'image/png',
    generation,
    frames: {
      frameSize: layout.cell,
      frameCount: keyed.length,
      // Playback when nothing drives the frame (the engine does, by pose).
      frameDelay: CHARACTER_POSES[0].frameDelay,
      looping: true,
      poses: buildPoses(plan),
    },
  };
}
