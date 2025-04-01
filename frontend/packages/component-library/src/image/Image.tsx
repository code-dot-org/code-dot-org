import classNames from 'classnames';
import {ImgHTMLAttributes} from 'react';

import moduleStyles from './image.module.scss';

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLElement>, 'width' | 'height'> {
  /** Image source */
  src: string;
  /** Image alt text */
  altText?: string;
  /** Image loading attribute */
  loading?: 'eager' | 'lazy';
  /** Image decoration */
  decoration?: 'none' | 'border' | 'shadow';
  /** Custom className */
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
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Image Component.
 * Renders an image inside a fixed-size container while maintaining aspect ratio.
 * Supports DSCO common decorative options for border and box shadow.
 */
const Image: React.FC<ImageProps> = ({
  src,
  altText = '',
  loading = 'lazy',
  decoration = 'none',
  style,
  className,
  onLoad,
  onError,
  ...ImageHTMLAttributes
}) => (
  <figure
    className={classNames(
      moduleStyles.figureContainer,
      {
        [moduleStyles['figure-hasBorder']]: decoration === 'border',
        [moduleStyles['figure-hasBoxShadow']]: decoration === 'shadow',
      },
      className,
    )}
    // Only use inline styles if there's no way to add custom className with needed styles.
    style={style}
  >
    <img
      className={classNames(moduleStyles.image)}
      alt={altText}
      loading={loading}
      src={src}
      onLoad={onLoad}
      onError={onError}
      {...ImageHTMLAttributes}
    />
  </figure>
);

export default Image;
