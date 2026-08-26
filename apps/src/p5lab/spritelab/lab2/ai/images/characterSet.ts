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
  CHARACTER_POSES,
  CharacterFacing,
  CharacterPose,
  GENERATED_FACINGS,
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
import {
  CHARACTER_SET_IMAGE_SIZE,
  CHARACTER_SET_THINKING_LEVEL,
  ImageSize,
  getCharacterSetImageModel,
} from './modelHelpers';
import {poseFigureDataURI} from './poseFigures';
import {
  isFigure,
  isSolid,
  MAX_FRAME_ATTEMPTS,
  POSE_MATCH_THRESHOLD,
  poseMatch,
  silhouetteBands,
  SilhouetteBands,
} from './poseScore';
import {loadImageFromBlob, removeKeyColor} from './removeBackground';
import {columnSpans} from './sheetSlice';
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

/** One picture to ask for: the design plate, or a frame of the sheet. */
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
  /** Attach the figure for this pose (poseFigures.ts) as the last reference. */
  poseFigure: boolean;
  /**
   * The design plate: the character drawn once, standing with arms at its
   * sides, as the reference every frame is drawn from. Not a sheet frame.
   * Whatever arm pose the plate has, the model tends to copy into the walk
   * (arms held straight out when the plate held them out); hanging arms are
   * the least conspicuous habit to inherit, and the legs followed the
   * figures best from such a plate.
   */
  isBase: boolean;
}

/**
 * Every picture of a set in generation order: the design plate first, then
 * each generated facing's poses in turn (right first, so a left-facing
 * frame, when one is generated, can be drawn from its right-facing twin).
 * The frames after the plate are the sheet, in order; each pose's frames
 * are contiguous and in frame order.
 */
export function planCharacterFrames(): FramePlan[] {
  const plan: FramePlan[] = [
    {
      pose: 'stand',
      facing: 'right',
      frame: 0,
      references: [],
      poseFigure: false,
      isBase: true,
    },
  ];
  const indexOf = (
    pose: CharacterPose,
    facing: CharacterFacing,
    frame: number
  ) =>
    plan.findIndex(
      p =>
        !p.isBase && p.pose === pose && p.facing === facing && p.frame === frame
    );
  GENERATED_FACINGS.forEach(facing => {
    CHARACTER_POSES.forEach(({pose, frameCount}) => {
      for (let frame = 0; frame < frameCount; frame++) {
        const references: FrameReference[] = [];
        const add = (index: number, mirrored: boolean) => {
          if (index >= 0 && !references.some(r => r.index === index)) {
            references.push({index, mirrored});
          }
        };
        const flip = facing === 'left';
        add(0, flip);
        if (flip) {
          add(indexOf(pose, 'right', frame), true);
        }
        plan.push({
          pose,
          facing,
          frame,
          references,
          poseFigure: true,
          isBase: false,
        });
      }
    });
  });
  return plan;
}

/** Every picture of the plan: the plate and each sheet frame. */
export const CHARACTER_SET_FRAME_COUNT = planCharacterFrames().length;

/**
 * Poses whose frames are asked for as one picture: a row of frames in a
 * single image, which the model keeps coherent because it draws them side
 * by side, where frames asked for one at a time each rolled their own arm
 * swing. Cut apart afterwards (sheetSlice.ts).
 */
export const SHEET_POSES: CharacterPose[] = ['walk'];

/** A row of frames needs the room; single frames stay at the set size. */
export const SHEET_IMAGE_SIZE: ImageSize = '2K';

/** Whether a plan entry's pose is drawn as one row picture. */
export function isSheetPose(plan: FramePlan): boolean {
  return !plan.isBase && SHEET_POSES.includes(plan.pose);
}

/** How many pictures a set costs — one per sheet pose, one per other frame. */
export const CHARACTER_SET_PICTURE_COUNT = planCharacterFrames().filter(
  (step, i, plan) =>
    !isSheetPose(step) ||
    !plan
      .slice(0, i)
      .some(
        p => isSheetPose(p) && p.pose === step.pose && p.facing === step.facing
      )
).length;

/** The frames of the plan that make up the sheet, in sheet order. */
export function sheetFrames(plan: FramePlan[]): FramePlan[] {
  return plan.filter(step => !step.isBase);
}

/** The pose ranges of a sheet laid out in plan order (plate excluded). */
export function buildPoses(plan: FramePlan[]): AnimationPoses {
  const poses: AnimationPoses = {};
  sheetFrames(plan).forEach((step, index) => {
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

// The poses themselves are pictures (poseFigures.ts); the text names no
// limb. Three runs whose text described the pose had the model honour the
// words' emphasis and the plate's habits over the figure — arms hanging,
// then arms shouting while the legs shuffled, then the plate's arms-out
// pose in every walking frame. The figure alone is the pose.

// The four keys of a side-view walk cycle, by their names in animation —
// the vocabulary that walk-cycle sprite sheets are labelled with wherever
// they appear, which is the one kind of pose text that might carry signal
// for a pixel sprite. Names only; no limbs.
const WALK_KEY_NAMES = ['contact', 'down', 'passing', 'up'];

/** One animator's label for the frame: what it is, not how to draw it. */
export function frameKeyLabel(plan: FramePlan): string {
  const {frameCount} = CHARACTER_POSES.find(p => p.pose === plan.pose)!;
  switch (plan.pose) {
    case 'walk':
      return `frame ${
        plan.frame + 1
      } of ${frameCount} of a side-view walk cycle sprite sheet, the ${
        WALK_KEY_NAMES[plan.frame % WALK_KEY_NAMES.length]
      } pose`;
    case 'jump':
      return plan.frame === 0
        ? 'the rising frame of a jump'
        : 'the falling frame of a jump';
    default:
      return `frame ${plan.frame + 1} of ${frameCount} of an idle animation`;
  }
}

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
  return `Use a plain, solid, flat background of exactly one color, ${key.name} (${key.hex}), filling the image to every edge — no gradient, no scenery, no ground, and no shadow under the character. Only the character on that flat ${key.name}. The character itself must contain no ${key.name} or anything close to it anywhere — not on clothes, hat, hair, skin or accessories; choose other colors for those.`;
}

/**
 * The prompt for the design plate: the whole character, facing right, arms
 * hanging at the sides.
 */
export function basePrompt(
  prompt: string,
  style: ImageStyle,
  key: KeyColor
): string {
  return (
    `${prompt}. Show the whole character standing, facing right: its face ` +
    'and body point toward the right side of the image. Arms hanging ' +
    'relaxed at the sides, hands open and empty. Feet near the bottom of the ' +
    'image, nothing cut off. ' +
    `${ONLY_THIS_CHARACTER} ${styleClause(style)} ${keyClause(key)}`
  );
}

/**
 * The prompt for one sheet frame, drawn from the plate and its figure. The
 * text carries the character and the constraints; the pose is the figure's.
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
    ? ' The last provided image is a silhouette figure: draw the character in exactly that pose — the whole body, legs, feet, arms and torso, as the figure has them. Take nothing else from the figure: none of its colors, outlines, edges or shapes appear on the character. The pose comes only from the figure; the character image shows only what the character looks like.'
    : '';
  return (
    `The character: ${prompt}. ${characterImages}${figure} This is ` +
    `${frameKeyLabel(plan)}. Draw the same character — same design, colors, ` +
    'proportions, outfit and art style, the same scale. ' +
    `${facingClause(plan.facing)} ${ONLY_THIS_CHARACTER} ${keyClause(key)} ` +
    `${styleClause(style)}`
  );
}

/**
 * The prompt for a pose's whole row of frames in one picture, drawn from the
 * plate. The motion is described as a cycle, not posed frame by frame: the
 * model's own sense of a walk carries the frames, and it keeps them coherent
 * because it draws them together.
 */
export function sheetPrompt(
  prompt: string,
  plan: FramePlan,
  frameCount: number,
  style: ImageStyle,
  key: KeyColor
): string {
  const motion =
    plan.pose === 'walk'
      ? 'one complete side-view walk cycle: the legs stride and the arms swing opposite to the legs, so the frames read as smooth continuous walking when played in order and the last frame leads back into the first'
      : `one complete ${POSE_LABELS[plan.pose]} animation`;
  return (
    `The character: ${prompt}. The provided image shows this character. ` +
    `Draw a sprite sheet of exactly ${frameCount} frames of this character in a single horizontal row, left to right, evenly spaced, with clear ${key.name} gaps between the frames and no frame touching another. ` +
    `The ${frameCount} frames are ${motion}. In every frame draw the same character — same design, colors, proportions, outfit and art style, the same scale, feet on the same baseline. ` +
    `${facingClause(
      plan.facing
    )} ${ONLY_THIS_CHARACTER} No frame numbers, labels, borders or grid lines. ${keyClause(
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
  /** Silhouette widths, for scoring against the figure. */
  bands: SilhouetteBands | null;
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
    bands: silhouetteBands(data, canvas.width, canvas.height, isSolid),
  };
}

/** A keyed row picture cut into its frames, left to right. */
async function sliceSheet(
  raw: RawImage,
  frameCount: number,
  style: ImageStyle,
  key: KeyColor
): Promise<KeyedFrame[]> {
  const whole = await keyFrame(raw, style, key);
  const {width, height} = whole.canvas;
  const {data} = whole.canvas
    .getContext('2d')!
    .getImageData(0, 0, width, height);
  return columnSpans(data, width, height, frameCount, SOLID_ALPHA).map(span => {
    const canvas = document.createElement('canvas');
    canvas.width = span.right - span.left;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      whole.canvas,
      span.left,
      0,
      canvas.width,
      height,
      0,
      0,
      canvas.width,
      height
    );
    const frameData = ctx.getImageData(0, 0, canvas.width, height).data;
    return {
      canvas,
      bounds: findOpaqueBounds(frameData, canvas.width, height, SOLID_ALPHA),
      bands: silhouetteBands(frameData, canvas.width, height, isSolid),
    };
  });
}

/** The figure's own band widths, from its rendered PNG. */
async function figureBands(
  figureDataURI: string
): Promise<SilhouetteBands | null> {
  const img = await loadDataURI(figureDataURI);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return silhouetteBands(data, canvas.width, canvas.height, isFigure);
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
  /** The pose that frame was drawn to, for showing its figure beside it. */
  previewPose?: {pose: CharacterPose; facing: CharacterFacing; frame: number};
  /** How well the previewed frame matched its figure, 0–1, when scored. */
  match?: number;
}

const POSE_LABELS: Record<CharacterPose, string> = {
  stand: 'standing',
  walk: 'walking',
  jump: 'jumping',
};

export function frameLabel(plan: FramePlan): string {
  if (plan.isBase) {
    return 'the character';
  }
  const {frameCount} = CHARACTER_POSES.find(p => p.pose === plan.pose)!;
  return `${POSE_LABELS[plan.pose]} ${plan.facing}, frame ${
    plan.frame + 1
  } of ${frameCount}`;
}

/**
 * Generate a character set as one sprite-sheet result: every pose's frames
 * in one grid, with `frames.poses` naming each range. Frames are requested
 * one at a time, in plan order, since each is drawn from ones before it,
 * and a frame that misses its figure (poseScore.ts) is asked for again.
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
  let previewPose: CharacterSetProgress['previewPose'];
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    if (isSheetPose(step)) {
      // One picture for the whole pose; its frames are the next plan entries.
      const {frameCount} = CHARACTER_POSES.find(p => p.pose === step.pose)!;
      onProgress?.({
        done: i,
        total: plan.length,
        label: `${POSE_LABELS[step.pose]} ${
          step.facing
        }, all ${frameCount} frames`,
        preview,
        previewPose,
      });
      const plateURI = bytesToDataURI(raws[0].uint8Array, raws[0].mediaType);
      const raw = await requestFrameWithRetry(
        sheetPrompt(prompt, step, frameCount, options.style, key),
        {
          seed,
          temperature: options.temperature,
          references: [
            step.facing === 'left' ? await mirrorDataURI(plateURI) : plateURI,
          ],
          imageSize: SHEET_IMAGE_SIZE,
          model: getCharacterSetImageModel(),
          thinkingLevel: CHARACTER_SET_THINKING_LEVEL,
        }
      );
      const frames = await sliceSheet(raw, frameCount, options.style, key);
      frames.forEach(frame => {
        raws.push(raw);
        keyed.push(frame);
      });
      const shown = framePreview(frames[frames.length - 1]);
      if (shown) {
        preview = shown;
        previewPose = {
          pose: step.pose,
          facing: step.facing,
          frame: frameCount - 1,
        };
      }
      i += frameCount - 1;
      continue;
    }
    const text = step.isBase
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
    let figure: SilhouetteBands | null = null;
    if (step.poseFigure) {
      const figureURI = await poseFigureDataURI(
        step.pose,
        step.frame,
        step.facing
      );
      references.push(figureURI);
      figure = await figureBands(figureURI);
    }
    // Ask, score, and ask again while the frame misses its figure; keep the
    // best. The plate has no figure and is taken as it comes.
    let best: {raw: RawImage; frame: KeyedFrame; match: number} | null = null;
    const attempts = figure ? MAX_FRAME_ATTEMPTS : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      onProgress?.({
        done: i,
        total: plan.length,
        label: frameLabel(step) + (attempt ? ` (try ${attempt + 1})` : ''),
        preview,
        previewPose,
        match: best?.match,
      });
      const raw = await requestFrameWithRetry(text, {
        seed: seed + attempt,
        temperature: options.temperature,
        references,
        imageSize: CHARACTER_SET_IMAGE_SIZE,
        model: getCharacterSetImageModel(),
        thinkingLevel: CHARACTER_SET_THINKING_LEVEL,
      });
      const frame = await keyFrame(raw, options.style, key);
      const match =
        figure && frame.bands ? poseMatch(frame.bands, figure).score : 1;
      if (!best || match > best.match) {
        best = {raw, frame, match};
      }
      if (match >= POSE_MATCH_THRESHOLD) {
        break;
      }
    }
    raws.push(best!.raw);
    keyed.push(best!.frame);
    const shown = framePreview(best!.frame);
    if (shown) {
      preview = shown;
      previewPose = step.isBase
        ? undefined
        : {pose: step.pose, facing: step.facing, frame: step.frame};
    }
  }
  onProgress?.({
    done: plan.length,
    total: plan.length,
    label: 'assembling',
    preview,
    previewPose,
  });

  // The plate is a reference only; the sheet is the frames after it.
  const frames = keyed.filter((_, i) => !plan[i].isBase);
  const cell = cellSize(frames.map(frame => frame.bounds));
  let maxPixels = MAX_SHEET_PIXELS;
  let layout = sheetLayout(frames.length, cell, maxPixels);
  let blob = await composeSheet(frames, layout);
  // A very detailed sheet can still encode too large; re-lay it smaller.
  for (let attempt = 0; blob.size > MAX_SHEET_BYTES && attempt < 3; attempt++) {
    maxPixels *= 0.6;
    layout = sheetLayout(frames.length, cell, maxPixels);
    blob = await composeSheet(frames, layout);
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
      frameCount: frames.length,
      // Playback when nothing drives the frame (the engine does, by pose).
      frameDelay: CHARACTER_POSES[0].frameDelay,
      looping: true,
      poses: buildPoses(plan),
    },
  };
}
