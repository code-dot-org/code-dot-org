// Character sets: the same character drawn idling, walking and jumping,
// kept as ONE animation whose picture is the five-frame strip
// characterAnimations.ts describes (second idle, stand, mid-stride walk,
// rising jump, falling jump, facing right; runtime mirroring covers left).
//
// The strip is assembled here, never asked of the model: the base frame is
// one ordinary generation, and each other frame is an edit request that
// passes the base picture back, so the character stays itself. Every frame
// is drawn on a key colour we name (keyColor.ts) and keyed out afterwards.

import {
  AnimationPoses,
  CHARACTER_STRIP_FRAME_COUNT,
  CHARACTER_STRIP_POSES,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {findOpaqueBounds} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';
import {createUuid} from '@cdo/apps/utils';

import {bytesToDataURI} from './encoding';
import {CachedImage} from './imageCache';
import {
  GeneratedImageResult,
  pixelBlockFor,
  RawImage,
  rawImageToBlob,
  requestImage,
} from './imageGeneration';
import {checkImageSafety, checkPromptSafety, markHandled} from './imageSafety';
import {chooseKeyColor, KEY_COLORS} from './keyColor';
import {
  CHARACTER_SET_IMAGE_SIZE,
  getCharacterSetImageModel,
} from './modelHelpers';
import {
  basePrompt,
  CHARACTER_SET_PICTURE_COUNT,
  logicalGridFor,
  POSED_FRAMES,
  posePrompt,
} from './prompts';
import {
  canvasToBlob,
  loadImageFromBlob,
  removeKeyColor,
} from './removeBackground';
import {ImageGenerationMetadata, ImageStyle} from './types';

// The strip's square cell. 512 covers typical on-screen sprite sizes 1:1
// (a large story-scene sprite on a high-density screen can exceed it and
// render softer — the accepted tradeoff), and the decoded strip is a third
// the memory of the previous 768 cells.
const STRIP_CELL_PX = 512;

// If an unusually detailed strip still encodes too large, redraw it smaller
// once; past that, let it through and take the upload as it comes.
const MAX_STRIP_BYTES = 4_000_000;

// Alpha above this counts as the character when the strip is framed.
const SOLID_ALPHA = 64;

// Breathing room kept around the crop's sides and top, so an anti-aliased
// edge isn't shaved.
const CROP_PAD_PX = 2;

// The strip frames that stand on the ground: everything through the walk
// range's end (the jump frames follow, per CHARACTER_STRIP_POSES).
const WALK_RANGE = CHARACTER_STRIP_POSES['walk-right']!;
const GROUNDED_FRAMES = WALK_RANGE.start + WALK_RANGE.count;

/**
 * The keyed frames drawn into one strip of square cells. The model
 * leaves margin around the character, and the physics body's feet are the
 * image's bottom edge — kept as-is, the character floats above what it
 * stands on and renders small in its cell. One crop — the union of every
 * frame's content, its floor on the grounded frames' feet — is cut from
 * all frames alike, so the crop cannot disturb their registration, then
 * scaled to fill the cell, bottom-aligned. A falling frame's toes may
 * reach below the grounded feet and clip: it is airborne when shown.
 */
async function composeStrip(
  frames: Blob[],
  cell: number,
  style: ImageStyle
): Promise<Blob> {
  const images = await Promise.all(frames.map(loadImageFromBlob));
  // All frames are read in the first frame's coordinates; a stray
  // different-sized response is stretched to them.
  const width = images[0].width;
  const height = images[0].height;
  const rasters = images.map(img => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = style === 'smooth';
    ctx.drawImage(img, 0, 0, width, height);
    const {data} = ctx.getImageData(0, 0, width, height);
    return {canvas, bounds: findOpaqueBounds(data, width, height, SOLID_ALPHA)};
  });

  const boxes = rasters
    .map(r => r.bounds)
    .filter((b): b is NonNullable<typeof b> => b !== null);
  const grounded = rasters
    .slice(0, GROUNDED_FRAMES)
    .map(r => r.bounds)
    .filter((b): b is NonNullable<typeof b> => b !== null);
  const crop = boxes.length
    ? {
        left: Math.max(0, Math.min(...boxes.map(b => b.left)) - CROP_PAD_PX),
        top: Math.max(0, Math.min(...boxes.map(b => b.top)) - CROP_PAD_PX),
        right: Math.min(
          width - 1,
          Math.max(...boxes.map(b => b.right)) + CROP_PAD_PX
        ),
        bottom: Math.max(
          ...(grounded.length ? grounded : boxes).map(b => b.bottom)
        ),
      }
    : {left: 0, top: 0, right: width - 1, bottom: height - 1};
  const cropW = crop.right - crop.left + 1;
  const cropH = crop.bottom - crop.top + 1;
  const scale = Math.min(cell / cropW, cell / cropH);
  const destW = Math.max(1, Math.round(cropW * scale));
  const destH = Math.max(1, Math.round(cropH * scale));
  const dx = Math.round((cell - destW) / 2);
  const dy = cell - destH;

  const strip = document.createElement('canvas');
  strip.width = cell * frames.length;
  strip.height = cell;
  const ctx = strip.getContext('2d')!;
  ctx.imageSmoothingEnabled = style === 'smooth';
  // The cell is now half the model's output, so this draw is a real
  // downscale; default (low) smoothing visibly softens it.
  ctx.imageSmoothingQuality = 'high';
  rasters.forEach((raster, index) => {
    ctx.drawImage(
      raster.canvas,
      crop.left,
      crop.top,
      cropW,
      cropH,
      index * cell + dx,
      dy,
      destW,
      destH
    );
  });
  return canvasToBlob(strip);
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
  /** Logical grid to ask for (pixel style); absent = the sprite default. */
  pixelGrid?: number;
  /** Take every frame from the cache instead of the model; see
      GenerateImageOptions.cached. */
  cached?: CachedImage;
}

export interface CharacterSetProgress {
  /** Frames finished so far, of total. */
  done: number;
  total: number;
  /** What just finished drawing, for the dialog to show. */
  label: string;
  /** The last frame finished, keyed, for the dialog to show. */
  preview?: string;
}

/**
 * Generate a character set as one strip result (frames.poses names the
 * ranges). The base frame is drawn first; the posed frames are drawn from
 * it in parallel.
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
  const {cached} = options;
  const sidecar = cached ? await cached.sidecar() : undefined;
  // A cached set was keyed on the colour its generator chose from the
  // words of its day; the sidecar says which, in case the words changed.
  const key =
    (sidecar?.keyColor &&
      KEY_COLORS[sidecar.keyColor as keyof typeof KEY_COLORS]) ||
    chooseKeyColor(prompt);
  // One seed for the whole set; parallel frames offset it so alike prompts
  // don't collapse into alike drawings.
  const seed =
    sidecar?.seed ?? options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const temperature = sidecar ? sidecar.temperature : options.temperature;
  const pixelBlock = pixelBlockFor(
    'sprite',
    sidecar?.pixelGrid ?? options.pixelGrid
  );
  const total = CHARACTER_SET_PICTURE_COUNT;
  const drawFrame = (
    frame: string,
    text: string,
    request: Parameters<typeof requestImage>[1]
  ) => (cached ? cached.raw(frame) : requestFrameWithRetry(text, request));
  const keyFrame = (raw: RawImage) =>
    removeKeyColor(rawImageToBlob(raw), key.rgb, {
      soft: options.style === 'smooth',
    });
  const previewURI = async (blob: Blob) =>
    bytesToDataURI(new Uint8Array(await blob.arrayBuffer()), 'image/png');

  // The prompt judge runs while the base picture draws; its verdict gates
  // everything after (the posed frames embed the same student text). A
  // cached set was reviewed before upload: neither judge runs.
  const promptVerdict = cached
    ? Promise.resolve()
    : markHandled(checkPromptSafety(prompt));
  // Judge every generated frame. Each verdict is awaited before that
  // frame's preview shows, so flagged pixels never reach the progress UI.
  const judgeFrame = (raw: RawImage): Promise<void> =>
    cached ? Promise.resolve() : markHandled(checkImageSafety(raw));

  onProgress?.({done: 0, total, label: 'the character'});
  const base = await drawFrame(
    'base',
    basePrompt(prompt, options.style, key, pixelBlock),
    {
      seed,
      temperature,
      imageSize: CHARACTER_SET_IMAGE_SIZE,
      model: getCharacterSetImageModel(),
    }
  );
  await promptVerdict;
  const baseVerdict = judgeFrame(base);
  const baseURI = bytesToDataURI(base.uint8Array, base.mediaType);
  const baseKeyed = await keyFrame(base);
  // Also gates the posed frames: a flagged base costs one generation, not
  // five.
  await baseVerdict;
  let done = 1;
  let preview = await previewURI(baseKeyed);
  onProgress?.({done, total, label: 'the character', preview});

  // The posed frames each reference only the base, so they draw in
  // parallel: a set costs two round trips, not five.
  const posed = await Promise.all(
    POSED_FRAMES.map(async (frame, index) => {
      const raw = await drawFrame(
        frame.label,
        posePrompt(prompt, frame, options.style, key, pixelBlock),
        {
          seed: seed + index + 1,
          temperature,
          references: [baseURI],
          imageSize: CHARACTER_SET_IMAGE_SIZE,
          model: getCharacterSetImageModel(),
        }
      );
      const verdict = judgeFrame(raw);
      const keyed = await keyFrame(raw);
      await verdict;
      done++;
      preview = await previewURI(keyed);
      // The posed frames finish in no particular order; the label names
      // what just landed.
      onProgress?.({done, total, label: frame.label, preview});
      return keyed;
    })
  );

  onProgress?.({done: total, total, label: 'assembling', preview});

  // Strip order: the second idle, the base between the ranges that share
  // it, then the walk and jump frames (CHARACTER_STRIP_POSES).
  const stripFrames = [posed[0], baseKeyed, ...posed.slice(1)];
  let cell = STRIP_CELL_PX;
  let blob = await composeStrip(stripFrames, cell, options.style);
  if (blob.size > MAX_STRIP_BYTES) {
    cell = Math.round(cell * 0.6);
    blob = await composeStrip(stripFrames, cell, options.style);
  }

  const generation: ImageGenerationMetadata = {
    prompt,
    imageType: 'sprite',
    style: options.style,
    seed,
    ...(temperature !== undefined && {temperature}),
    ...(options.style === 'pixel' && {
      pixelGrid: logicalGridFor(pixelBlock),
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
