// Lab2
//
// A React component used for a ScriptLevel that uses Lab2.  It examines the
// set of levels in the current lesson, determines the set of apps they use,
// and instantiates a React component for each app that it supports.  This
// allows level switching between those levels without a page reload.

import React from 'react';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {getStandaloneProjectId} from '@cdo/apps/lab2/projects/utils';
import Lab2Wrapper from './Lab2Wrapper';
import ProjectContainer from '../projects/ProjectContainer';
import MetricsAdapter from './MetricsAdapter';
import LabRenderer from './LabRenderer';

const Lab2: React.FunctionComponent = () => {
  return (
    <Lab2Wrapper>
      <MetricsAdapter />
      <ProjectContainer channelId={getStandaloneProjectId()}>
        <LabRenderer />
      </ProjectContainer>
    </Lab2Wrapper>
  );
};

const Lab2WithProvider: React.FunctionComponent = () => {
  return (
    <Provider store={getStore()}>
      <Lab2 />
    </Provider>
  );
};

export default Lab2WithProvider;
