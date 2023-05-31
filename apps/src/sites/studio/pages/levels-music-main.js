import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import ProjectContainer from '@cdo/apps/labs/projects/ProjectContainer';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer>
        <ProjectContainer>
          <MusicLabView />
        </ProjectContainer>
      </LabContainer>
    </Provider>,
    document.getElementById('musiclab-container')
  );
});
