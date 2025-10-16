'use client';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import React, {ImgHTMLAttributes, useMemo} from 'react';

import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> {
  /** Image source */
  src?: string;
  /** Image alt text */
  altText?: string;
  /** Image decoration */
  decoration?: 'none' | 'border' | 'shadow';
  /** Image has rounded corners */
  hasRoundedCorners?: boolean;
  /** Custom className */
  className?: string;
}

const ImageRoot = styled('figure', {
  name: 'MuiImage',
  slot: 'root',
})(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  margin: 0,
}));

const ImageElement = styled('img', {
  name: 'MuiImage',
  slot: 'imageElement',
})(() => ({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  margin: 0,
  padding: 0,
}));

const Image: React.FC<ImageProps> = ({
  src,
  altText,
  decoration,
  hasRoundedCorners,
  className,
}) => {
  // Get the image source URL from Contentful
  const imageSource = useMemo(() => src && getAbsoluteImageUrl(src), [src]);

  // Show placeholder text until a content entry is added
  if (!src || !imageSource) {
    return (
      <Typography variant="body3" sx={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🖼️ Image placeholder.</strong> Please add an "Image" content
          type or image asset entry in the Content sidebar.
        </em>
      </Typography>
    );
  }

  return (
    <ImageRoot
      className={classNames(
        decoration === 'border' && `image--hasBorder`,
        decoration === 'shadow' && `image--hasShadow`,
        hasRoundedCorners && `image--hasRoundedCorners`,
        className,
      )}
    >
      <ImageElement alt={altText || ''} loading="lazy" src={imageSource} />
    </ImageRoot>
  );
};

export default Image;
