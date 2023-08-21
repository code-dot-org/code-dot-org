/** @file Top-level view for AI Chat Lab */

import React, {useCallback} from 'react';
import moduleStyles from './aichatView.module.scss';
import ChatWorkspace from './ChatWorkspace';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
const commonI18n = require('@cdo/locale');

const AichatView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const beforeNextLevel = useCallback(() => {
    dispatch(sendSuccessReport('aichat'));
  }, [dispatch]);

  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <div className={moduleStyles.instructionsArea}>
        <PanelContainer
          id="aichat-instructions"
          headerText={commonI18n.instructions()}
        >
          <Instructions beforeNextLevel={beforeNextLevel} />
        </PanelContainer>
      </div>
      <div className={moduleStyles.chatWorkspaceArea}>
        <ChatWorkspace />
      </div>
    </div>
  );
};

export default AichatView;
