// The project's images as the Images tab lists them, read from the classic
// animation-list store.

import {PixelEditorSaveMeta} from '@cdo/apps/pixelEditor/PixelEditor';

import {
  ImageGenerationMetadata,
  ImageSubject,
  ImageType,
} from '../../ai/images/types';
import {AnimationPoses} from '../../characterAnimations';
import {galleryOrder, imageTypeFromCategories} from '../../imageGallery';
import {getImageThumbnail} from '../../imageTrim';

/** The animation fields the Images tab reads and writes. */
export interface ImageProps {
  name?: string;
  categories?: string[];
  dataURI?: string;
  sourceUrl?: string;
  frameSize?: {x: number; y: number};
  frameCount?: number;
  frameDelay?: number;
  looping?: boolean;
  poses?: AnimationPoses;
  pixelGridSize?: number;
  trimmed?: boolean;
  generation?: ImageGenerationMetadata;
  recentColors?: PixelEditorSaveMeta['recentColors'];
  role?: string;
}

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
    const imageType = imageTypeFromCategories(props.categories);
    return [
      {
        key,
        props,
        name: props.name ?? '',
        imageType,
        subject: imageType === 'sprite' ? props.generation?.subject : undefined,
        thumb: getImageThumbnail(props.name ?? '') || src,
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
