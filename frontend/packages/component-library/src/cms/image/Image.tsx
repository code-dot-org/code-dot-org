import classNames from 'classnames';
import {ImgHTMLAttributes} from 'react';

import moduleStyles from './image.module.scss';

export interface ImageProps extends ImgHTMLAttributes<HTMLElement> {
  /** Image source */
  src: string;
  /** Image alt text */
  altText?: string;
  /** Image border */
  hasBorder?: boolean;
  /** Image box shadow */
  hasBoxShadow?: boolean;
  /** Image custom className */
  className?: string;
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
  hasBorder = false,
  hasBoxShadow = false,
  className,
  ...HTMLAttributes
}: ImageProps) => {
  return (
    <img
      className={classNames(
        moduleStyles.image,
        moduleStyles[hasBorder ? 'image-hasBorder' : ''],
        moduleStyles[hasBoxShadow ? 'image-hasBoxShadow' : ''],
        className,
      )}
      alt={altText}
      src={src}
      {...HTMLAttributes}
    />
  );
};

export default Image;
