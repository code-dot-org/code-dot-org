import React from 'react';

import {hasPreview} from '@cdo/apps/codebridge';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ConsoleAndPreviewShare from './ConsoleAndPreviewShare';
import ConsoleShare from './ConsoleShare';

import moduleStyles from './share-view.module.scss';

const ShareView: React.FunctionComponent = () => {
  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );

  return (
    <div className={moduleStyles.shareContainer}>
      <div className={moduleStyles.sidebar}>Sidebar</div>
      {hasPreview(miniApp) ? <ConsoleAndPreviewShare /> : <ConsoleShare />}
    </div>
  );
};

export default ShareView;
