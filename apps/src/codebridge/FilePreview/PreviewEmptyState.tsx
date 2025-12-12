import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React from 'react';

import emptyPreviewPlaceholderImage from '@cdo/apps/codebridge/images/empty-preview-placeholder.svg';

import moduleStyles from './styles/inner-html-preview.module.scss';

const PreviewEmptyState = () => {
  return (
    <div className={moduleStyles.placeholderContainer}>
      <CodebridgeEmptyState
        imageProps={{src: emptyPreviewPlaceholderImage}}
        title="Nothing to preview"
        description="Your project preview will appear here once you've created or opened a page with content."
      />
    </div>
  );
};

export default PreviewEmptyState;
