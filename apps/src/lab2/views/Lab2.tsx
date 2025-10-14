/**
 * Lab2
 *
 * The top-level component that houses all Lab2 framework components.
 */
import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {Provider} from 'react-redux';

import {AiChatDisabledProvider} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {getStore} from '@cdo/apps/redux';
import BrowserTextToSpeechWrapper from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';

import MultiProjectContainer from '../projects/MultiProjectContainer';

import RubricFABContainer from './components/rubrics/RubricFABContainer';
import RubricWrapper from './components/rubrics/RubricWrapper';
import DialogManager from './dialogs/DialogManager';
import Lab2IdleTimer from './Lab2IdleTimer';
import Lab2Wrapper from './Lab2Wrapper';
import LabViewsRenderer from './LabViewsRenderer';
import MetricsAdapter from './MetricsAdapter';

const Lab2: React.FunctionComponent = () => {
  return (
    <Provider store={getStore()}>
      <BrowserTextToSpeechWrapper>
        <RubricWrapper>
          <ThemeProvider>
            <Lab2Wrapper>
              <DialogManager>
                <MetricsAdapter />
                <Lab2IdleTimer />
                <MultiProjectContainer>
                  <AiChatDisabledProvider>
                    <LabViewsRenderer />
                  </AiChatDisabledProvider>
                </MultiProjectContainer>
                <RubricFABContainer />
              </DialogManager>
            </Lab2Wrapper>
          </ThemeProvider>
        </RubricWrapper>
      </BrowserTextToSpeechWrapper>
    </Provider>
  );
};

export default Lab2;
