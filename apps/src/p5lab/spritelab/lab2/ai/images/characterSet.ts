// Character sets: the same character drawn standing, walking and jumping,
// kept as ONE animation whose picture is the 4x1 strip characterAnimations.ts
// describes (stand, mid-stride walk, rising jump, falling jump, facing
// right; runtime mirroring covers left).
//
// The strip is assembled here, never asked of the model: the base frame is
// one ordinary generation, and each other frame is an edit request that
// passes the base picture back, so the character stays itself. Every frame
// is drawn on a key colour we name (keyColor.ts) and keyed out afterwards.

import {createUuid} from '@cdo/apps/utils';

import {
  AnimationPoses,
  CHARACTER_STRIP_FRAME_COUNT,
  CHARACTER_STRIP_POSES,
} from '../../characterAnimations';

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
  getCharacterSetImageModel,
} from './modelHelpers';
import {loadImageFromBlob, removeKeyColor} from './removeBackground';
import {ImageGenerationMetadata, ImageStyle} from './types';

/** One frame of the strip after the base: its label and pose description. */
interface PosedFrame {
  label: string;
  pose: string;
}

// The three frames drawn from the base, in strip order after it. The pose
// text rides on an edit request that carries the base picture, so it only
// has to say what changes.
const POSED_FRAMES: PosedFrame[] = [
  {
    label: 'walking',
    pose:
      'halfway through a walking stride, seen from the side — mainly the ' +
      'legs moving, one leg forward and one back, the arms swinging slightly',
  },
  {
    label: 'jumping',
    pose:
      'the rising frame of a jump: knees bent and tucked, body springing ' +
      'upward',
  },
  {
    label: 'landing',
    pose:
      'the falling frame of a jump: body upright in the air, legs loose ' +
      'beneath it, coming down',
  },
];

/** How many pictures a set costs: the base and each posed frame. */
export const CHARACTER_SET_PICTURE_COUNT = 1 + POSED_FRAMES.length;

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
 * The prompt for the base frame: the whole character, standing, facing
 * right — the picture every other frame is drawn from.
 */
export function basePrompt(
  prompt: string,
  style: ImageStyle,
  key: KeyColor
): string {
  return (
    `${prompt}. Show the whole character standing, facing right: its face ` +
    'and body point toward the right side of the image. Arms hanging ' +
    'relaxed at the sides, hands open and empty. Feet near the bottom of ' +
    'the image, nothing cut off. ' +
    `${ONLY_THIS_CHARACTER} ${styleClause(style)} ${keyClause(key)}`
  );
}

/**
 * The prompt for one posed frame, drawn as an edit of the base picture.
 * The same-size-and-position clause is what keeps the frames registered:
 * they play in place, so a character that drifts or rescales between
 * frames reads as jitter.
 */
export function posePrompt(
  prompt: string,
  frame: PosedFrame,
  style: ImageStyle,
  key: KeyColor
): string {
  return (
    `The provided image shows this character: ${prompt}. Redraw the same ` +
    `character as ${frame.pose}. Keep everything else exactly as in the ` +
    'provided image: the same design, colors, proportions, outfit and art ' +
    'style, facing right, and the character at exactly the same size and ' +
    'position in the frame. ' +
    `${ONLY_THIS_CHARACTER} ${keyClause(key)} ${styleClause(style)}`
  );
}

// The strip's square cell. Four cells of the model's native 1024 would
// break the 4MB asset bound comfortably kept below; four of these stay a
// modest PNG while a sprite drawn at playspace sizes (50-300px) loses
// nothing.
const STRIP_CELL_PX = 768;

// If an unusually detailed strip still encodes too large, redraw it smaller
// once; past that, let it through and take the upload as it comes.
const MAX_STRIP_BYTES = 4_000_000;

/** The keyed frames drawn into one 4x1 strip of square cells. */
async function composeStrip(frames: Blob[], cell: number): Promise<Blob> {
  const images = await Promise.all(frames.map(loadImageFromBlob));
  const strip = document.createElement('canvas');
  strip.width = cell * frames.length;
  strip.height = cell;
  const ctx = strip.getContext('2d')!;
  images.forEach((img, index) => {
    ctx.drawImage(img, index * cell, 0, cell, cell);
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

// One pause-and-retry per frame: a transient failure gets one more try
// after a breath rather than a burst.
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
  /** The last frame finished, keyed, for the dialog to show. */
  preview?: string;
}

/**
 * Generate a character set as one strip result (frames.poses names the
 * ranges). The base frame is drawn first; the three posed frames are drawn
 * from it in parallel.
 *
 * Pixel style is keyed like a single sprite but not grid-normalized: each
 * frame would find its own grid and land at its own scale, and the frames
 * of one strip must agree.
 */
export async function generateCharacterSet(
  prompt: string,
  options: CharacterSetOptions,
  onProgress?: (progress: CharacterSetProgress) => void
): Promise<GeneratedImageResult> {
  const key = chooseKeyColor(prompt);
  // One seed for the whole set; parallel frames offset it so alike prompts
  // don't collapse into alike drawings.
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const total = CHARACTER_SET_PICTURE_COUNT;
  const keyFrame = (raw: RawImage) =>
    removeKeyColor(rawImageToBlob(raw), key.rgb, {
      soft: options.style === 'smooth',
    });
  const previewURI = async (blob: Blob) =>
    bytesToDataURI(new Uint8Array(await blob.arrayBuffer()), 'image/png');

  onProgress?.({done: 0, total, label: 'the character'});
  const base = await requestFrameWithRetry(
    basePrompt(prompt, options.style, key),
    {
      seed,
      temperature: options.temperature,
      imageSize: CHARACTER_SET_IMAGE_SIZE,
      model: getCharacterSetImageModel(),
      thinkingLevel: CHARACTER_SET_THINKING_LEVEL,
    }
  );
  const baseURI = bytesToDataURI(base.uint8Array, base.mediaType);
  const baseKeyed = await keyFrame(base);
  let done = 1;
  let preview = await previewURI(baseKeyed);
  onProgress?.({done, total, label: POSED_FRAMES[0].label, preview});

  // The posed frames each reference only the base, so they draw in
  // parallel: a set costs two round trips, not four.
  const posed = await Promise.all(
    POSED_FRAMES.map(async (frame, index) => {
      const raw = await requestFrameWithRetry(
        posePrompt(prompt, frame, options.style, key),
        {
          seed: seed + index + 1,
          temperature: options.temperature,
          references: [baseURI],
          imageSize: CHARACTER_SET_IMAGE_SIZE,
          model: getCharacterSetImageModel(),
          thinkingLevel: CHARACTER_SET_THINKING_LEVEL,
        }
      );
      const keyed = await keyFrame(raw);
      done++;
      preview = await previewURI(keyed);
      onProgress?.({
        done,
        total,
        label: POSED_FRAMES[Math.min(index + 1, POSED_FRAMES.length - 1)].label,
        preview,
      });
      return keyed;
    })
  );

  onProgress?.({done: total, total, label: 'assembling', preview});
  let cell = STRIP_CELL_PX;
  let blob = await composeStrip([baseKeyed, ...posed], cell);
  if (blob.size > MAX_STRIP_BYTES) {
    cell = Math.round(cell * 0.6);
    blob = await composeStrip([baseKeyed, ...posed], cell);
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
  const poses: AnimationPoses = CHARACTER_STRIP_POSES;
  return {
    filename: `generated-${createUuid()}.png`,
    uint8Array: new Uint8Array(await blob.arrayBuffer()),
    mediaType: 'image/png',
    generation,
    frames: {
      frameSize: {x: cell, y: cell},
      frameCount: CHARACTER_STRIP_FRAME_COUNT,
      // Playback when nothing drives the frame (the engine does, by pose).
      frameDelay: CHARACTER_STRIP_POSES['stand-right']!.frameDelay,
      looping: true,
      poses,
    },
  };
}
