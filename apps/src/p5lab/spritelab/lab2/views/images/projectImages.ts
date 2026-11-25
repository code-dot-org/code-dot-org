// The project's images as the Images tab lists them, read from the
// animation-list store.

import {
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {
  AnimationPoses,
  CHARACTER_STRIP_BASE_FRAME,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  galleryOrder,
  imageTypeFromCategories,
} from '@cdo/apps/p5lab/spritelab/lab2/imageGallery';
import {getImageThumbnail} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';
import {RuntimeAnimationProps} from '@cdo/apps/p5lab/spritelab/lab2/types';

/** An animation's fields as the Images tab reads them: any may be missing
    on an image a project saved before the field existed. */
export type ImageProps = Partial<RuntimeAnimationProps>;

export interface AnimationListState {
  orderedKeys: string[];
  propsByKey: Record<string, ImageProps | undefined>;
}

export interface ProjectImage {
  key: string;
  props: ImageProps;
  name: string;
  imageType: ImageType;
  subject?: ImageSubject;
  /** The small image for the list's tile. */
  thumb?: string;
  /** Set for a sheet with no small image: the frame the tile draws from
      the sheet instead. */
  tileFrame?: {
    src: string;
    frameSize: {x: number; y: number};
    index: number;
  };
  /** The full image. */
  src?: string;
  /** Pixel art upscales with hard edges. */
  pixelated: boolean;
  /** Set for a character set: its sheet, played in the frame. */
  sheet?: {
    src: string;
    frameSize: {x: number; y: number};
    poses: AnimationPoses;
  };
}

/** The project's images in gallery order. */
export function listProjectImages(list: AnimationListState): ProjectImage[] {
  const images = list.orderedKeys.flatMap(key => {
    const props = list.propsByKey[key];
    if (!props) {
      return [];
    }
    const src = props.dataURI || props.sourceUrl || undefined;
    const smallImage = getImageThumbnail(props.name ?? '');
    const imageType = imageTypeFromCategories(props.categories);
    return [
      {
        key,
        props,
        name: props.name || 'image',
        imageType,
        // An image with poses is a character set, so its subject is
        // 'character' regardless of stored metadata; a single-frame sprite
        // keeps its stored subject, when there is one.
        subject:
          imageType !== 'sprite'
            ? undefined
            : props.poses
            ? 'character'
            : props.subject ?? props.generation?.subject,
        thumb: smallImage || src,
        // Must match the frame trimAnimationListImages makes the small image
        // from, so the tile does not change picture when that arrives.
        tileFrame:
          !smallImage && src && (props.frameCount ?? 1) > 1 && props.frameSize
            ? {
                src,
                frameSize: props.frameSize,
                index: props.poses ? CHARACTER_STRIP_BASE_FRAME : 0,
              }
            : undefined,
        src,
        pixelated: !!props.pixelGridSize,
        sheet:
          props.poses && src && props.frameSize
            ? {src, frameSize: props.frameSize, poses: props.poses}
            : undefined,
      },
    ];
  });
  return galleryOrder(images, image => image.imageType);
}
