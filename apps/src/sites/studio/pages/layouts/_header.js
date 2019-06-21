import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ProjectInfo from '@cdo/apps/code-studio/components/header/ProjectInfo';
import {getStore} from '@cdo/apps/redux';

const container = document.getElementsByClassName('project_info');
if (container.length) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <ProjectInfo />
    </Provider>,
    container[0]
  );
}
