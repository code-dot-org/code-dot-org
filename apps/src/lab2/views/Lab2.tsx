/**
 * Lab2
 *
 * The top-level component that houses all Lab2 framework components.
 */
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {
  getServerLevelId,
  getStandaloneProjectId,
  isShareView,
} from '@cdo/apps/lab2/projects/utils';
import Lab2Wrapper from './Lab2Wrapper';
import ProjectContainer from '../projects/ProjectContainer';
import MetricsAdapter from './MetricsAdapter';
import LabViewsRenderer from './LabViewsRenderer';
import DialogManager from './dialogs/DialogManager';
import ThemeWrapper from './ThemeWrapper';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import {setIsShareView} from '../lab2Redux';

const Lab2: React.FunctionComponent = () => {
  // Store some server-provided data in redux.

  const dispatch = useAppDispatch();
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  // Store the level ID provided by App Options in redux if necessary.
  // This is needed on pages without a header, such as the share view.
  const serverLevelId = getServerLevelId();
  useEffect(() => {
    if (!currentLevelId && serverLevelId) {
      dispatch(setCurrentLevelId(serverLevelId.toString()));
    }
  }, [currentLevelId, serverLevelId, dispatch]);

  // Store whether we are in share view in redux, from App Options.
  const shareView = isShareView();
  useEffect(() => {
    if (shareView !== undefined) {
      dispatch(setIsShareView(shareView));
    }
  }, [shareView, dispatch]);

  return (
    <Provider store={getStore()}>
      <ThemeWrapper>
        <Lab2Wrapper>
          <DialogManager>
            <MetricsAdapter />
            <ProjectContainer channelId={getStandaloneProjectId()}>
              <LabViewsRenderer />
            </ProjectContainer>
          </DialogManager>
        </Lab2Wrapper>
      </ThemeWrapper>
    </Provider>
  );
};

export default Lab2;
