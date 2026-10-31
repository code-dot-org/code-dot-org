// The chosen image's pixels as the model should see them: a data URI at
// the model's size, one frame of a character set.

import {toImage} from '@cdo/apps/imageUtils';
import {
  NATIVE_PIXEL_GRID,
  upscaleImageNearest,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';

import {MODEL_OUTPUT_PX} from '../../ai/images/modelHelpers';
import {AnimationPoses} from '../../characterAnimations';

import {ImageProps} from './projectImages';

const readAsDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/** Where a strip's standing frame sits: the base picture the set was drawn
    from, the last frame of the stand range. */
function standingFrameIndex(poses?: AnimationPoses): number {
  const stand = poses?.['stand-right'];
  return stand ? stand.start + stand.count - 1 : 0;
}

async function cropStandingFrame(
  dataURI: string,
  frameSize: {x: number; y: number},
  poses?: AnimationPoses
): Promise<string> {
  const img = await toImage(dataURI);
  const canvas = document.createElement('canvas');
  canvas.width = frameSize.x;
  canvas.height = frameSize.y;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return dataURI;
  }
  ctx.drawImage(img, -standingFrameIndex(poses) * frameSize.x, 0);
  return canvas.toDataURL('image/png');
}

/** The image's current pixels for the model, or null when they cannot be
    read. */
export async function currentPixels(props: ImageProps): Promise<string | null> {
  let dataURI = props.dataURI ?? null;
  try {
    if (dataURI?.startsWith('blob:')) {
      dataURI = await readAsDataURL(await (await fetch(dataURI)).blob());
    } else if (!dataURI && props.sourceUrl) {
      dataURI = await readAsDataURL(
        await (await HttpClient.get(props.sourceUrl)).blob()
      );
    }
    if (!dataURI) {
      return null;
    }
    // Pixel art is stored at its logical size; the model drew it at its
    // own, and sees it there again.
    if (props.pixelGridSize === NATIVE_PIXEL_GRID) {
      dataURI = (
        await upscaleImageNearest(dataURI, (width, height) =>
          Math.floor(MODEL_OUTPUT_PX / Math.max(width, height))
        )
      ).dataURI;
    }
    return props.poses && props.frameSize
      ? await cropStandingFrame(dataURI, props.frameSize, props.poses)
      : dataURI;
  } catch {
    return null;
  }
}
