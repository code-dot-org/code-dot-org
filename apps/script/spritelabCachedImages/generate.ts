// Draws the pictures the image cache serves (imageCache.ts): for every word
// combination of the chosen adlib sets, N variants, as the model returns
// them. Nothing is processed here; the lab's own pipeline runs on these
// files when a student picks the combo, so later improvements to it reach
// cached pictures too. Prompts come from the same modules the lab uses.
//
// Run through run.sh (it bundles this for Node):
//
//   ./script/spritelabCachedImages/run.sh generate --out ../cache_output \
//     --set sprite-hero --variants 3
//
// Resumable: a variant whose sidecar exists is skipped, so a stopped run
// picks up where it left off. --stub draws placeholders without the model,
// for exercising the tree and the lab end to end. Set
// GOOGLE_GENERATIVE_AI_API_KEY for real runs.

import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {generateText} from 'ai';
import {promises as fs} from 'fs';
import * as path from 'path';
import {deflateSync} from 'zlib';

import {
  adlibSlots,
  adlibText,
  imageAdlibById,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageAdlibs';
import {
  CachedSidecar,
  comboPath,
  frameFileName,
  IMAGE_CACHE_VERSION,
  variantName,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  chooseKeyColor,
  KEY_COLORS,
  KeyColor,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/keyColor';
import {
  ASSUMED_BLOCK,
  CHARACTER_SET_IMAGE_MODEL,
  CHARACTER_SET_IMAGE_SIZE,
  imageProviderOptions,
  ImageSize,
  MODEL_OUTPUT_PX,
  SINGLE_IMAGE_MODEL,
  SINGLE_IMAGE_SIZE,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {
  basePrompt,
  logicalGridFor,
  POSED_FRAMES,
  posePrompt,
  singleImagePrompt,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/prompts';
import {
  IMAGE_TYPES,
  ImageStyle,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

/** The sets the hoai2026-dev image levels name (levelMode.adlibs). */
const DEFAULT_SETS = [
  'sprite-hero',
  'sprite-friend',
  'background-story',
  'background-platform',
  'block-simple',
  'sprite-treasure',
];

// The student form's defaults: the slider's middle is 1.0, and asking for a
// character set calms it to 0.6 so the posed frames agree with the base
// (GenerateImageView).
const SINGLE_TEMPERATURE = 1.0;
const CHARACTER_SET_TEMPERATURE = 0.6;

// One pause-and-retry per picture, as the lab does.
const RETRY_DELAY_MS = 4000;

interface Args {
  out: string;
  version: string;
  sets: string[];
  styles: ImageStyle[];
  variants: number;
  concurrency: number;
  limit?: number;
  stub: boolean;
  dryRun: boolean;
}

const USAGE = `Usage: run.sh generate --out DIR [options]
  --out DIR            where the tree goes (DIR/<version>/...)
  --version NAME       tree version (default ${IMAGE_CACHE_VERSION})
  --set ID             adlib set to draw, repeatable (default: the six
                       hoai2026-dev sets)
  --style pixel|smooth style to draw, repeatable (default pixel)
  --variants N         variants per combo (default 3)
  --concurrency N      combos in flight at once (default 2)
  --limit N            stop after N combos (trial runs)
  --stub               placeholders, no model calls
  --dry-run            print the plan and exit
Env: GOOGLE_GENERATIVE_AI_API_KEY (real runs)`;

function parseArgs(argv: string[]): Args {
  const args: Args = {
    out: '',
    version: IMAGE_CACHE_VERSION,
    sets: [],
    styles: [],
    variants: 3,
    concurrency: 2,
    stub: false,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) {
        throw new Error(`${flag} needs a value`);
      }
      return v;
    };
    switch (flag) {
      case '--out':
        args.out = value();
        break;
      case '--version':
        args.version = value();
        break;
      case '--set':
        args.sets.push(value());
        break;
      case '--style': {
        const style = value();
        if (style !== 'pixel' && style !== 'smooth') {
          throw new Error(`unknown style ${style}`);
        }
        args.styles.push(style);
        break;
      }
      case '--variants':
        args.variants = Number(value());
        break;
      case '--concurrency':
        args.concurrency = Number(value());
        break;
      case '--limit':
        args.limit = Number(value());
        break;
      case '--stub':
        args.stub = true;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--help':
        console.log(USAGE);
        process.exit(0);
        break;
      default:
        throw new Error(`unknown argument ${flag}\n${USAGE}`);
    }
  }
  if (!args.out) {
    throw new Error(`--out is required\n${USAGE}`);
  }
  if (args.sets.length === 0) {
    args.sets = DEFAULT_SETS;
  }
  if (args.styles.length === 0) {
    args.styles = ['pixel'];
  }
  return args;
}

/** The type a set id names: its head, e.g. sprite-hero → sprite. */
function imageTypeOf(adlibId: string): ImageType {
  const imageType = IMAGE_TYPES.find(t => adlibId.startsWith(`${t}-`));
  if (!imageType) {
    throw new Error(`${adlibId} names no image type`);
  }
  return imageType;
}

/** Every combination of the set's options, choice ids in slot order. */
function combos(adlibId: string): Record<string, string>[] {
  const adlib = imageAdlibById(adlibId);
  if (!adlib) {
    throw new Error(`no adlib set ${adlibId} in the bundled manifest`);
  }
  return adlibSlots(adlib).reduce<Record<string, string>[]>(
    (acc, slot) =>
      acc.flatMap(partial =>
        adlib.options[slot].map(option => ({...partial, [slot]: option.id}))
      ),
    [{}]
  );
}

interface Job {
  adlibId: string;
  imageType: ImageType;
  choices: Record<string, string>;
  choiceIds: string[];
  style: ImageStyle;
  variant: number;
  folder: string;
}

interface Picture {
  bytes: Uint8Array;
  mediaType: string;
}

interface Drawer {
  (
    text: string,
    request: {
      seed: number;
      temperature: number;
      imageSize: ImageSize;
      model: string;
      reference?: Picture;
    }
  ): Promise<Picture>;
}

/** requestImage's rule: a thinking model sends drafts first; keep the last. */
function modelDrawer(apiKey: string): Drawer {
  const google = createGoogleGenerativeAI({apiKey});
  const once: Drawer = async (text, request) => {
    const {files} = await generateText({
      model: google(request.model),
      messages: [
        {
          role: 'user',
          content: request.reference
            ? [
                {
                  type: 'image' as const,
                  image: request.reference.bytes,
                  mediaType: request.reference.mediaType,
                },
                {type: 'text' as const, text},
              ]
            : text,
        },
      ],
      seed: request.seed,
      temperature: request.temperature,
      providerOptions: imageProviderOptions(request.imageSize),
    });
    const images = files.filter(f => f.mediaType.startsWith('image/'));
    const last = images[images.length - 1];
    if (!last) {
      throw new Error('No image was generated');
    }
    return {bytes: last.uint8Array, mediaType: last.mediaType};
  };
  return async (text, request) => {
    try {
      return await once(text, request);
    } catch {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return once(text, request);
    }
  };
}

// --- Stub pictures: a flat key-coloured field with a blocky figure on it,
// enough for the lab's keying, cropping and pixel-grid detection to work.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(Buffer.from(type, 'ascii'), 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

function encodePng(rgba: Uint8Array, size: number): Uint8Array {
  const rows = new Uint8Array((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    rows.set(
      rgba.subarray(y * size * 4, (y + 1) * size * 4),
      y * (size * 4 + 1) + 1
    );
  }
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, size);
  view.setUint32(4, size);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', new Uint8Array(deflateSync(rows))),
    pngChunk('IEND', new Uint8Array(0)),
  ]);
}

function stubDrawer(): Drawer {
  return async (text, request) => {
    const size = MODEL_OUTPUT_PX;
    const block = 16;
    const rgba = new Uint8Array(size * size * 4);
    // A background scene fills the frame; anything else sits on a field the
    // lab keys out: the named key colour when the prompt names one, else a
    // flat blue no figure uses.
    const key = Object.values(KEY_COLORS).find(k => text.includes(k.hex));
    const field: [number, number, number] = key
      ? key.rgb
      : text.includes('scene')
      ? [90, 160, 220]
      : [40, 40, 200];
    // The seed shapes the figure so variants differ.
    const radius = (size / 4) * (0.7 + ((request.seed % 7) / 7) * 0.3);
    const cx = size / 2;
    const cy = size * 0.55;
    const figure: [number, number, number] = [
      200 + (request.seed % 50),
      120 + (request.seed % 90),
      60 + (request.seed % 120),
    ];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const bx = Math.floor(x / block) * block + block / 2;
        const by = Math.floor(y / block) * block + block / 2;
        const inside =
          !text.includes('scene') &&
          (bx - cx) ** 2 + (by - cy) ** 2 < radius ** 2;
        const rgb = inside ? figure : field;
        const i = (y * size + x) * 4;
        rgba[i] = rgb[0];
        rgba[i + 1] = rgb[1];
        rgba[i + 2] = rgb[2];
        rgba[i + 3] = 255;
      }
    }
    return {bytes: encodePng(rgba, size), mediaType: 'image/png'};
  };
}

async function drawJob(job: Job, draw: Drawer, args: Args): Promise<void> {
  const adlib = imageAdlibById(job.adlibId)!;
  const prompt = adlibText(adlib, job.choices);
  const pixelBlock = ASSUMED_BLOCK[job.imageType];
  const pixelGrid =
    job.style === 'pixel' ? logicalGridFor(pixelBlock) : undefined;
  const seed = Math.floor(Math.random() * 2 ** 31);
  const nn = variantName(job.variant);
  const characterSet = job.imageType === 'sprite';
  const frames: CachedSidecar['frames'] = {};
  let keyColor: KeyColor | undefined;

  await fs.mkdir(job.folder, {recursive: true});
  const save = async (frame: string, text: string, picture: Picture) => {
    await fs.writeFile(
      path.join(
        job.folder,
        frameFileName(job.variant, frame, picture.mediaType, characterSet)
      ),
      picture.bytes
    );
    frames[frame] = {mediaType: picture.mediaType, prompt: text};
  };

  if (characterSet) {
    keyColor = chooseKeyColor(prompt);
    const request = {
      temperature: CHARACTER_SET_TEMPERATURE,
      imageSize: CHARACTER_SET_IMAGE_SIZE,
      model: CHARACTER_SET_IMAGE_MODEL,
    };
    const baseText = basePrompt(prompt, job.style, keyColor, pixelBlock);
    const base = await draw(baseText, {...request, seed});
    await save('base', baseText, base);
    // The posed frames reference only the base, so they draw together.
    await Promise.all(
      POSED_FRAMES.map(async (frame, index) => {
        const text = posePrompt(
          prompt,
          frame,
          job.style,
          keyColor!,
          pixelBlock
        );
        const picture = await draw(text, {
          ...request,
          seed: seed + index + 1,
          reference: base,
        });
        await save(frame.label, text, picture);
      })
    );
  } else {
    const text = singleImagePrompt(
      prompt,
      job.imageType,
      job.style,
      pixelBlock
    );
    const picture = await draw(text, {
      seed,
      temperature: SINGLE_TEMPERATURE,
      imageSize: SINGLE_IMAGE_SIZE,
      model: SINGLE_IMAGE_MODEL,
    });
    await save('single', text, picture);
  }

  const sidecar: CachedSidecar = {
    adlibId: job.adlibId,
    choices: job.choices,
    prompt,
    imageType: job.imageType,
    style: job.style,
    characterSet,
    seed,
    temperature: characterSet ? CHARACTER_SET_TEMPERATURE : SINGLE_TEMPERATURE,
    ...(pixelGrid && {pixelGrid}),
    ...(keyColor && {
      keyColor: Object.entries(KEY_COLORS).find(([, k]) => k === keyColor)![0],
    }),
    model: args.stub
      ? 'stub'
      : characterSet
      ? CHARACTER_SET_IMAGE_MODEL
      : SINGLE_IMAGE_MODEL,
    generatedAt: new Date().toISOString(),
    frames,
  };
  // Written last: its presence is what marks the variant finished.
  await fs.writeFile(
    path.join(job.folder, `${nn}.json`),
    JSON.stringify(sidecar, null, 2) + '\n'
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(args.out, args.version);

  const jobs: Job[] = [];
  for (const adlibId of args.sets) {
    const imageType = imageTypeOf(adlibId);
    const adlib = imageAdlibById(adlibId)!;
    const slots = adlibSlots(adlib);
    for (const choices of combos(adlibId)) {
      const choiceIds = slots.map(slot => choices[slot]);
      for (const style of args.styles) {
        const folder = path.join(root, comboPath(adlibId, choiceIds, style));
        for (let variant = 0; variant < args.variants; variant++) {
          jobs.push({
            adlibId,
            imageType,
            choices,
            choiceIds,
            style,
            variant,
            folder,
          });
        }
      }
    }
  }
  const pending: Job[] = [];
  for (const job of jobs) {
    const done = await fs
      .access(path.join(job.folder, `${variantName(job.variant)}.json`))
      .then(() => true)
      .catch(() => false);
    if (!done) {
      pending.push(job);
    }
  }
  const selected =
    args.limit !== undefined ? pending.slice(0, args.limit) : pending;
  const pictures = selected.reduce(
    (sum, job) =>
      sum + (job.imageType === 'sprite' ? 1 + POSED_FRAMES.length : 1),
    0
  );
  console.log(
    `${jobs.length} variants across ${args.sets.length} sets; ` +
      `${jobs.length - pending.length} already done; ` +
      `drawing ${selected.length} (${pictures} pictures) into ${root}`
  );
  if (args.dryRun) {
    return;
  }

  let draw: Drawer;
  if (args.stub) {
    draw = stubDrawer();
  } else {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GOOGLE_GENERATIVE_AI_API_KEY is not set (or use --stub)'
      );
    }
    draw = modelDrawer(apiKey);
  }

  let next = 0;
  let finished = 0;
  let failed = 0;
  const worker = async () => {
    while (next < selected.length) {
      const job = selected[next++];
      const label = `${comboPath(
        job.adlibId,
        job.choiceIds,
        job.style
      )}/${variantName(job.variant)}`;
      const started = Date.now();
      try {
        await drawJob(job, draw, args);
        finished++;
        console.log(
          `[${finished + failed}/${selected.length}] ${label} ` +
            `(${((Date.now() - started) / 1000).toFixed(1)}s)`
        );
      } catch (e) {
        failed++;
        console.error(
          `[${finished + failed}/${selected.length}] ${label} FAILED: ${e}`
        );
      }
    }
  };
  await Promise.all(
    Array.from({length: Math.max(1, args.concurrency)}, worker)
  );
  console.log(`${finished} done, ${failed} failed`);
  if (failed) {
    process.exitCode = 1;
  }
}

main().catch(e => {
  console.error(e.message || e);
  process.exit(1);
});
