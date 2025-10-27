'use client';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import React, {ImgHTMLAttributes, useMemo} from 'react';

import NextImage from '@/components/nextImage/NextImage';
import {
  getAbsoluteImageUrl,
  getImageEntityFromImageUrl,
} from '@/selectors/contentful/getImage';

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

const imageStyles: object = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  margin: 0,
  padding: 0,
};

/** Raw HTML img element styled component */
const RawImageElement = styled('img', {
  name: 'MuiImage',
  slot: 'imageElement',
})(() => ({
  ...imageStyles,
}));

/** Next.js image element styled component */
const NextImageElement = styled(NextImage, {
  name: 'MuiImage',
  slot: 'imageElement',
})(() => ({
  ...imageStyles,
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
  const imageEntity = getImageEntityFromImageUrl(imageSource);

  const imageHeight = imageEntity?.fields?.file?.details?.image?.height;
  const imageWidth = imageEntity?.fields?.file?.details?.image?.width;

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
      {/* Use Next.js Image component if we have image dimensions to prevent layout shift */}
      {imageHeight && imageWidth ? (
        <NextImageElement
          alt={altText || ''}
          loading="lazy"
          src={imageSource}
          fill={false}
          height={imageHeight}
          width={imageWidth}
        />
      ) : (
        <RawImageElement alt={altText || ''} loading="lazy" src={imageSource} />
      )}
    </ImageRoot>
  );
};

export default Image;
