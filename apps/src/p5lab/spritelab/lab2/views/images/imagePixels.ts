// Reads the chosen image into the form the model takes as an input image: a
// PNG data URI at the model's output size; for a character set, only its
// standing frame.

import {blobToDataURI, toImage} from '@cdo/apps/imageUtils';
import {MODEL_OUTPUT_PX} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {
  drawStripCell,
  FrameSize,
  standingFrameIndex,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  NATIVE_PIXEL_GRID,
  upscaleImageNearest,
} from '@cdo/apps/pixelEditor/pixelArt';
import HttpClient from '@cdo/apps/util/HttpClient';

import {ImageProps} from './projectImages';

const readAsDataURL = (blob: Blob) =>
  new Promise<string>(resolve => blobToDataURI(blob, resolve));

async function cropStandingFrame(
  dataURI: string,
  frameSize: FrameSize,
  poses: NonNullable<ImageProps['poses']>
): Promise<string> {
  const img = await toImage(dataURI);
  return drawStripCell(img, frameSize, standingFrameIndex(poses)).toDataURL(
    'image/png'
  );
}

/** The image's current pixels for the model, or null when they cannot be
    read. */
export async function currentPixels(props: ImageProps): Promise<string | null> {
  let dataURI = props.dataURI ?? null;
  try {
    if (dataURI?.startsWith('blob:')) {
      // A blob URL is read by the browser itself; HttpClient is for the
      // server.
      dataURI = await readAsDataURL(await (await fetch(dataURI)).blob());
    } else if (!dataURI && props.sourceUrl) {
      dataURI = await readAsDataURL(
        await (await HttpClient.get(props.sourceUrl)).blob()
      );
    }
    if (!dataURI) {
      return null;
    }
    if (props.poses && props.frameSize) {
      dataURI = await cropStandingFrame(dataURI, props.frameSize, props.poses);
    }
    // Pixel art is stored at one image pixel per art pixel. The model works
    // at MODEL_OUTPUT_PX, so the picture is scaled back up, nearest
    // neighbor, to that size before it is sent.
    if (props.pixelGridSize === NATIVE_PIXEL_GRID) {
      dataURI = (
        await upscaleImageNearest(dataURI, (width, height) =>
          Math.floor(MODEL_OUTPUT_PX / Math.max(width, height))
        )
      ).dataURI;
    }
    return dataURI;
  } catch {
    return null;
  }
}
