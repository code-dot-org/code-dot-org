// What the image generator produces, owned here beside the code that makes it.

// Every image kind, in canonical display order: the gallery's groups and the
// dialog's Type choice both follow it. 'block' is a square platform tile:
// keyed and cropped to its content so copies tile seamlessly on the grid.
export const IMAGE_TYPES = ['background', 'sprite', 'block'] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

// What a sprite depicts. A character can be drawn as an animated set; an
// object (a treasure, a prop) is one still picture.
export const IMAGE_SUBJECTS = ['character', 'object'] as const;
export type ImageSubject = (typeof IMAGE_SUBJECTS)[number];

// Visual style. 'pixel' yields crisp pixel art with hard edges; 'smooth' a
// shaded illustration. See removeBackground's MatteOptions.
export type ImageStyle = 'smooth' | 'pixel';

// Display names, shared so the image dialog's summary and generate views use
// the same words.
export const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  sprite: 'Sprite',
  background: 'Background',
  block: 'Block',
};
export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  smooth: 'Smooth',
  pixel: 'Pixel art',
};

/** What the dialog calls an image: a sprite by its subject, else its type. */
export function imageKindLabel(
  imageType: ImageType,
  subject?: ImageSubject
): string {
  if (imageType === 'sprite') {
    return subject === 'object' ? 'Object' : 'Character';
  }
  return IMAGE_TYPE_LABELS[imageType];
}

/**
 * How an AI-generated image was made, recorded on its animation so a later
 * generation can replay the same roll of randomness or start from the current
 * image.
 */
export interface ImageGenerationMetadata {
  prompt: string;
  imageType: ImageType;
  /** A sprite's subject; absent on images made before the choice existed,
      and on other types. */
  subject?: ImageSubject;
  style: ImageStyle;
  /** Sending the same seed and prompt again asks for the same image. */
  seed: number;
  /** Sampling wildness the user chose; absent = the service default. */
  temperature?: number;
  /** Logical grid the pixel prompt asked for (e.g. 64 for 64x64); absent on
      pixel images generated before this was recorded. What came back can
      differ — the model honors the grid softly. */
  pixelGrid?: number;
  /** True when the image was made by modifying its previous version. */
  editedPrevious?: boolean;
}
