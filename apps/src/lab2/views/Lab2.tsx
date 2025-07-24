/**
 * Lab2
 *
 * The top-level component that houses all Lab2 framework components.
 */
import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import {getStandaloneProjectId} from '@cdo/apps/lab2/projects/utils';
import {getStore} from '@cdo/apps/redux';
import BrowserTextToSpeechWrapper from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';

import ProjectContainer from '../projects/ProjectContainer';

import RubricWrapper from './components/rubrics/RubricWrapper';
import DialogManager from './dialogs/DialogManager';
import Lab2Wrapper from './Lab2Wrapper';
import LabViewsRenderer from './LabViewsRenderer';
import MetricsAdapter from './MetricsAdapter';

const Lab2: React.FunctionComponent = () => {
  return (
    <Provider store={getStore()}>
      <BrowserTextToSpeechWrapper>
        <ThemeProvider>
          <Lab2Wrapper>
            <DialogManager>
              <MetricsAdapter />
              <ProjectContainer channelId={getStandaloneProjectId()}>
                <LabViewsRenderer />
              </ProjectContainer>
              <RubricWrapper />
            </DialogManager>
          </Lab2Wrapper>
        </ThemeProvider>
      </BrowserTextToSpeechWrapper>
    </Provider>
  );
};

export default Lab2;
