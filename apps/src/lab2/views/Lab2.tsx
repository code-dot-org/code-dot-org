/**
 * Lab2
 *
 * The top-level component that houses all Lab2 framework components.
 */
import React from 'react';
import {Provider} from 'react-redux';

import {getStandaloneProjectId} from '@cdo/apps/lab2/projects/utils';
import {getStore} from '@cdo/apps/redux';

import ProjectContainer from '../projects/ProjectContainer';

import DialogManager from './dialogs/DialogManager';
import Lab2Wrapper from './Lab2Wrapper';
import LabViewsRenderer from './LabViewsRenderer';
import MetricsAdapter from './MetricsAdapter';
import ThemeWrapper from './ThemeWrapper';

const Lab2: React.FunctionComponent = () => {
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
