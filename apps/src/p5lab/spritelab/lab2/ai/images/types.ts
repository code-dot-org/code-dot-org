// What the image generator produces, owned here beside the code that makes it.

// Every image kind, in canonical display order: the gallery's groups and the
// dialog's Type choice both follow it. 'block' is a square platform tile:
// keyed and cropped to its content so copies tile seamlessly on the grid.
export const IMAGE_TYPES = ['background', 'sprite', 'block'] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

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

/**
 * How an AI-generated image was made, recorded on its animation so a later
 * generation can replay the same roll of randomness or start from the current
 * image.
 */
export interface ImageGenerationMetadata {
  prompt: string;
  imageType: ImageType;
  style: ImageStyle;
  /** Sending the same seed and prompt again asks for the same image. */
  seed: number;
  /** Sampling wildness the user chose; absent = the service default. */
  temperature?: number;
  /** True when the image was made by modifying its previous version. */
  editedPrevious?: boolean;
}
