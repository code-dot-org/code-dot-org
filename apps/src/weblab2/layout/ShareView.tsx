import React from 'react';

import ShareButtonPanel from '@cdo/apps/lab2/views/components/layout/ShareButtonPanel';
import {HTMLPreview} from '@cdo/apps/weblab2/htmlPreview/HTMLPreview';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/share-layout.module.scss';

const ShareView: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.shareContainer}>
      <ShareButtonPanel />
      <div className={moduleStyles.previewContainer}>
        <HTMLPreview />
      </div>
    </div>
  );
};

export default ShareView;
