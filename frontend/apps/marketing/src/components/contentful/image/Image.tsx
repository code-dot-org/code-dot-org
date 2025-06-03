import React from 'react';

import DSCOImage from '@code-dot-org/component-library/image';

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
  // Show placeholder text until a content entry is added
  if (src == null) {
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
      src={src}
      altText={altText}
      decoration={decoration}
      hasRoundedCorners={hasRoundedCorners}
    />
  );
};

export default Image;
