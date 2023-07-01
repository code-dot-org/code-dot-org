import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import LabContainer from '@cdo/apps/code-studio/components/LabContainer';
import Lab2 from '@cdo/apps/labs/lab2';
import {logError} from '@cdo/apps/music/utils/MusicMetrics';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <LabContainer
        onError={(error, componentStack) =>
          logError({error: error.toString(), componentStack})
        }
      >
        <Lab2 />
      </LabContainer>
    </Provider>,

    document.getElementById('lab2-container')
  );
});
