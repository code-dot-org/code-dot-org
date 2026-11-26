// Drawn pixels wait here, per project, until the project's next save uploads
// them: drawing marks an image `pendingUpload`, and the project's sources
// preparer uploads each marked image's pixels to its file before the save
// writes the sources that name that file.

import type {SourcesPreparer} from '@cdo/apps/lab2/projects/ProjectManager';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {getSerializedAnimationList} from '@cdo/apps/p5lab/shapes';
import {dataURIToBytes} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {UploadImageFunction} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {SerializedAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {fileOf} from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';

interface HeldPixels {
  dataURI: string;
  revision: number;
}

const held = new Map<string, Map<string, HeldPixels>>();
// Projects whose saves run a preparer made here.
const preparing = new Set<string>();
let nextRevision = 1;

/** Whether this project's saves upload held pixels, so a drawing on one of
    its images can wait for the save instead of uploading. */
export function uploadsWithSave(channelId: string | undefined): boolean {
  return !!channelId && preparing.has(channelId);
}

/** Keeps an image's latest drawn pixels for the project's next save. */
export function holdPixels(channelId: string, key: string, dataURI: string) {
  let images = held.get(channelId);
  if (!images) {
    images = new Map();
    held.set(channelId, images);
  }
  images.set(key, {dataURI, revision: nextRevision++});
}

/** Whether pixels newer than `revision` are held for the image. */
export function hasNewerPixels(
  channelId: string,
  key: string,
  revision: number
): boolean {
  const current = held.get(channelId)?.get(key);
  return !!current && current.revision !== revision;
}

/** Forgets every held image, for tests. */
export function resetHeldPixels() {
  held.clear();
  preparing.clear();
}

// What naming a drawing's file reads from its image.
interface DrawnImage {
  name?: string;
  edited?: boolean;
  sourceUrl?: string;
}

// The form of the name a drawing's file gets. Uploaded pictures are named
// upload_<name>_<time> and generated ones generated-<id>, so neither
// matches.
const DRAWN_FILE = /^(?!upload_)[a-z0-9_]+_\d{13}\.png$/;

// The file name of a hand-drawn image's file; undefined for any other
// image, which gets a new file when it is first drawn on.
const drawnFileOf = (props: DrawnImage): string | undefined => {
  if (!props.edited || !props.sourceUrl?.startsWith('/v3/assets/')) {
    return undefined;
  }
  let name: string;
  try {
    name = decodeURIComponent(
      props.sourceUrl.split('?')[0].split('/').pop() ?? ''
    );
  } catch {
    return undefined;
  }
  return DRAWN_FILE.test(name) ? name : undefined;
};

/**
 * Uploads drawn pixels for an image and returns the link to store. A drawn
 * image's file is overwritten, and its link gets a new ?t= so the browser
 * and CDN do not serve the replaced file from cache. Any other image gets a
 * new file named after it. A level's starter assets get a new name from the
 * server on every upload, so their link is used as it is.
 */
export async function uploadDrawing(
  upload: UploadImageFunction,
  props: DrawnImage,
  dataURI: string
): Promise<string> {
  const safeName = (props.name || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
  const filename = drawnFileOf(props) ?? `${safeName}_${Date.now()}.png`;
  const uploadedUrl = await upload(
    filename,
    dataURIToBytes(dataURI),
    'image/png'
  );
  const replaceable = fileOf(uploadedUrl).endsWith(
    `/${encodeURIComponent(filename)}`
  );
  return replaceable ? `${fileOf(uploadedUrl)}?t=${Date.now()}` : uploadedUrl;
}

interface PreparerOptions {
  channelId: string;
  upload: UploadImageFunction;
  /** Called once an image's held pixels are uploaded, with the link the
      saved sources will name and the revision of the pixels uploaded. */
  onUploaded: (
    key: string,
    sourceUrl: string,
    revision: number,
    previousUrl: string | undefined
  ) => void;
  /** Called when an image's held pixels could not be uploaded; `hadFile`
      is whether the image already had a file to keep. */
  onUploadFailed: (key: string, error: unknown, hadFile: boolean) => void;
}

/**
 * The sources preparer for a project: uploads the held pixels of every image
 * the sources mark `pendingUpload`, and returns the sources with each such
 * image's link set to its file and the mark removed. When an upload fails,
 * the save goes ahead without those pixels: an image that has a file keeps
 * it, a new image is left out, the pixels stay held, and the save is
 * incomplete, so another follows.
 */
export function makeSourcesPreparer({
  channelId,
  upload,
  onUploaded,
  onUploadFailed,
}: PreparerOptions): SourcesPreparer {
  preparing.add(channelId);
  return async (sources: ProjectSources) => {
    const list = (sources as {animations?: SerializedAnimationList}).animations;
    const marked = list?.orderedKeys.filter(
      key => list.propsByKey[key]?.pendingUpload
    );
    if (!list || !marked?.length) {
      return {sources};
    }
    const propsByKey = {...list.propsByKey};
    const leftOut = new Set<string>();
    for (const key of marked) {
      const props = {...propsByKey[key]};
      delete props.pendingUpload;
      propsByKey[key] = props;
      const pixels = held.get(channelId)?.get(key);
      if (!pixels) {
        continue;
      }
      let sourceUrl: string;
      try {
        sourceUrl = await uploadDrawing(upload, props, pixels.dataURI);
      } catch (error) {
        onUploadFailed(key, error, !!props.sourceUrl);
        if (!props.sourceUrl) {
          leftOut.add(key);
        }
        continue;
      }
      if (!hasNewerPixels(channelId, key, pixels.revision)) {
        held.get(channelId)?.delete(key);
      }
      onUploaded(key, sourceUrl, pixels.revision, props.sourceUrl);
      props.sourceUrl = sourceUrl;
    }
    // Pixels still held: an upload failed, or newer pixels came in while it
    // ran.
    const stillHeld = marked.some(key => held.get(channelId)?.has(key));
    return {
      sources: {
        ...sources,
        animations: getSerializedAnimationList({
          orderedKeys: list.orderedKeys.filter(key => !leftOut.has(key)),
          propsByKey,
        }),
      },
      incomplete: stillHeld,
    };
  };
}
