// Writes <out>/<version>/manifest.json for a tree generate.ts drew: how
// many variants every combo has in every style, and which variants review
// rejected. The lab reads this file first (imageCache.ts) and asks for
// nothing it does not promise, so a partly drawn tree serves what it has.
//
//   ./script/spritelabCachedImages/run.sh manifest --out ../cache_output \
//     [--version v1] [--blocklist rejected.json]
//
// The block list is a JSON array of variant keys as the lab logs them,
// <adlibId>/<choice-ids>/<style>/<NN>.

import {promises as fs} from 'fs';
import * as path from 'path';

import {
  adlibSlots,
  imageAdlibById,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageAdlibs';
import {
  CachedAdlibEntry,
  CachedSidecar,
  IMAGE_CACHE_VERSION,
  ImageCacheManifest,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';

const USAGE = `Usage: run.sh manifest --out DIR [--version NAME] [--blocklist FILE]`;

interface Args {
  out: string;
  version: string;
  blocklist?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {out: '', version: IMAGE_CACHE_VERSION};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[++i];
    if (flag === '--help') {
      console.log(USAGE);
      process.exit(0);
    }
    if (value === undefined) {
      throw new Error(`${flag} needs a value\n${USAGE}`);
    }
    if (flag === '--out') {
      args.out = value;
    } else if (flag === '--version') {
      args.version = value;
    } else if (flag === '--blocklist') {
      args.blocklist = value;
    } else {
      throw new Error(`unknown argument ${flag}\n${USAGE}`);
    }
  }
  if (!args.out) {
    throw new Error(`--out is required\n${USAGE}`);
  }
  return args;
}

async function subdirs(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  return entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(args.out, args.version);
  const manifest: ImageCacheManifest = {
    version: args.version,
    adlibs: {},
    blockList: {},
  };

  for (const adlibId of await subdirs(root)) {
    const adlib = imageAdlibById(adlibId);
    if (!adlib) {
      console.warn(`skipping ${adlibId}: not in the bundled adlib manifest`);
      continue;
    }
    let characterSet: boolean | undefined;
    const variants: Record<string, number> = {};
    const comboDirs = await subdirs(path.join(root, adlibId));
    for (const combo of comboDirs) {
      for (const style of await subdirs(path.join(root, adlibId, combo))) {
        const folder = path.join(root, adlibId, combo, style);
        const sidecars = (await fs.readdir(folder)).filter(f =>
          /^\d\d\.json$/.test(f)
        );
        if (sidecars.length === 0) {
          continue;
        }
        const first = JSON.parse(
          await fs.readFile(path.join(folder, sidecars[0]), 'utf8')
        ) as CachedSidecar;
        characterSet = characterSet ?? first.characterSet;
        // The lab counts variants from 00 without gaps; a gap ends the
        // promise there, and the rest are for a rerun to fill.
        const numbers = sidecars.map(f => Number(f.slice(0, 2))).sort();
        let consecutive = 0;
        while (numbers[consecutive] === consecutive) {
          consecutive++;
        }
        if (consecutive < sidecars.length) {
          console.warn(
            `${adlibId}/${combo}/${style}: variants skip a number after ` +
              `${consecutive - 1}; only the first ${consecutive} count`
          );
        }
        variants[`${combo}/${style}`] = consecutive;
      }
    }
    const expectedCombos = adlibSlots(adlib).reduce(
      (n, slot) => n * adlib.options[slot].length,
      1
    );
    const counts = Object.values(variants);
    if (comboDirs.length < expectedCombos) {
      console.warn(
        `${adlibId}: ${comboDirs.length} of ${expectedCombos} combos drawn; ` +
          'the lab falls back to the model for the rest'
      );
    }
    const entry: CachedAdlibEntry = {
      slots: adlibSlots(adlib),
      characterSet: characterSet ?? false,
      variants,
    };
    manifest.adlibs[adlibId] = entry;
    console.log(
      `${adlibId}: ${counts.length} combo/style folders, ` +
        `${Math.min(...counts)}-${Math.max(...counts)} variants` +
        `${entry.characterSet ? ', character sets' : ''}`
    );
  }

  if (args.blocklist) {
    const keys = JSON.parse(
      await fs.readFile(args.blocklist, 'utf8')
    ) as string[];
    for (const key of keys) {
      const [adlibId, ...rest] = key.split('/');
      if (!manifest.adlibs[adlibId]) {
        console.warn(`block list names ${key}, which the tree lacks`);
        continue;
      }
      (manifest.blockList[adlibId] ??= []).push(rest.join('/'));
    }
    console.log(`${keys.length} variants blocked`);
  }

  const file = path.join(root, 'manifest.json');
  await fs.writeFile(file, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`wrote ${file}`);
}

main().catch(e => {
  console.error(e.message || e);
  process.exit(1);
});
