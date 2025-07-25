import React, {useMemo} from 'react';

import DSCOImage from '@code-dot-org/component-library/image';

import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';

type ImageProps = {
  /** Image URL */
  src?: string | null;
  /** Image alt text */
  altText?: string;
  /** Image decoration */
  decoration?: 'none' | 'border' | 'shadow';
  /** Image has rounded corners */
  hasRoundedCorners?: boolean;
};

const Image: React.FC<ImageProps> = ({
  src,
  altText,
  decoration,
  hasRoundedCorners,
}) => {
  const imgSrc = useMemo(() => src && getAbsoluteImageUrl(src), [src]);

  // Show placeholder text until a content entry is added
  if (!imgSrc) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🖼️ Image placeholder.</strong> Please add an "Image" content
          type or image asset entry in the Content sidebar.
        </em>
      </div>
    );
  }

  return (
    <DSCOImage
      src={imgSrc}
      altText={altText}
      decoration={decoration}
      hasRoundedCorners={hasRoundedCorners}
    />
  );
};

export default Image;
