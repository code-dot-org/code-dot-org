import React from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/share-layout.module.scss';

const MaximizedView: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.shareContainer}>
      <div className={moduleStyles.previewContainer}>
        <HTMLPreview />
      </div>
    </div>
  );
};

export default MaximizedView;
