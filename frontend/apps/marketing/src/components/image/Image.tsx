import React from 'react';

import DSCOImage, {ImageProps} from '@code-dot-org/component-library/cms/image';

const Image: React.FC<ImageProps> = ({src}) => {
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

  return <DSCOImage src={src} />;
};

export default Image;
