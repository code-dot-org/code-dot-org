/**
 * Lab2
 *
 * The top-level component that houses all Lab2 framework components.
 */
import React from 'react';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {getStandaloneProjectId} from '@cdo/apps/lab2/projects/utils';
import Lab2Wrapper from './Lab2Wrapper';
import ProjectContainer from '../projects/ProjectContainer';
import MetricsAdapter from './MetricsAdapter';
import LabViewsRenderer from './LabViewsRenderer';

const Lab2: React.FunctionComponent = () => {
  return (
    <Provider store={getStore()}>
      <Lab2Wrapper>
        <MetricsAdapter />
        <ProjectContainer channelId={getStandaloneProjectId()}>
          <LabViewsRenderer />
        </ProjectContainer>
      </Lab2Wrapper>
    </Provider>
  );
};

export default Lab2;
