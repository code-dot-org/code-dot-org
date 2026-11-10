import type {RuntimeAnimationList, RuntimeAnimationProps} from '../types';

/**
 * What the image pickers read: the project's images, and the URL of one that
 * has neither a trimmed thumbnail nor a source URL of its own. In apps the
 * pickers read both from the engine's animation-list store; here the lab
 * supplies them, and until it does the pickers offer only their empty state.
 */
export interface ImageSource {
  animationList(): RuntimeAnimationList | undefined;
  imageUrl(key: string, props: RuntimeAnimationProps): string;
}

let imageSource: ImageSource | null = null;

export function setImageSource(source: ImageSource | null): void {
  imageSource = source;
}

export function getImageSource(): ImageSource | null {
  return imageSource;
}
