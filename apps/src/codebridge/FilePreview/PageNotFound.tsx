import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React from 'react';

import pageNotFoundImage from '@cdo/apps/codebridge/images/page-not-found.png';

import moduleStyles from './styles/inner-html-preview.module.scss';

const PageNotFound = () => {
  return (
    <div className={moduleStyles.placeholderContainer}>
      <CodebridgeEmptyState
        imageProps={{src: pageNotFoundImage}}
        title="Page not found"
        description="The page you're trying to preview doesn't exist."
      />
    </div>
  );
};

export default PageNotFound;
