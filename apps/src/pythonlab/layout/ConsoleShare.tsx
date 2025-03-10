import React from 'react';

import Console from '@cdo/apps/codebridge/Console/Console';

import moduleStyles from './share-view.module.scss';

const ConsoleShare: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.consoleContainer}>
      <Console />
    </div>
  );
};

export default ConsoleShare;
