import classNames from 'classnames';
import {ImgHTMLAttributes} from 'react';

import moduleStyles from './image.module.scss';

export interface ImageProps extends ImgHTMLAttributes<HTMLElement> {
  /** Image source */
  src: string;
  /** Image alt text */
  altText?: string;
  /** Image decoration */
  decoration?: 'none' | 'border' | 'shadow';
  /** Image custom className */
  className?: string;
  /** Image onLoad callback */
  onLoad?: () => void;
  /** Image onError callback */
  onError?: () => void;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Image.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Image Component.
 * Adds an image to the page with decorative options for border and box shadow.
 */
const Image: React.FC<ImageProps> = ({
  src,
  altText = '',
  decoration = 'none',
  className,
  onLoad,
  onError,
  ...HTMLAttributes
}: ImageProps) => {
  return (
    <img
      className={classNames(
        moduleStyles.image,
        moduleStyles[decoration === 'border' ? 'image-hasBorder' : ''],
        moduleStyles[decoration === 'shadow' ? 'image-hasBoxShadow' : ''],
        className,
      )}
      alt={altText}
      src={src}
      {...HTMLAttributes}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default Image;
