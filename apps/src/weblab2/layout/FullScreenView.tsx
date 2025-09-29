import React from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/full-screen-view-layout.module.scss';

const FullScreenView: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.fullScreenViewContainer}>
      <HTMLPreview />
    </div>
  );
};

export default FullScreenView;
