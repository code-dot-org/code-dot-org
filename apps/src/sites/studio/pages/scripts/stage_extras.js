import React from 'react';
import ReactDOM from 'react-dom';
import StageExtras from '@cdo/apps/code-studio/components/stageExtras/StageExtras';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';

const script = document.querySelector('script[data-extras]');
const config = JSON.parse(script.dataset.extras);
const showProjectWidget = JSON.parse(script.dataset.widgetVisible);
const projectTypes = JSON.parse(script.dataset.widgetTypes);
const viewer = JSON.parse(script.dataset.viewer);
const store = getStore();

ReactDOM.render(
  <Provider store={store}>
    <StageExtras
      stageNumber={config.stageNumber}
      nextStageNumber={config.nextStageNumber}
      nextLevelPath={config.nextLevelPath}
      bonusLevels={config.bonusLevels}
      showProjectWidget={showProjectWidget}
      projectTypes={projectTypes}
      sectionId={viewer.section_id}
      userId={viewer.user_id}
    />
  </Provider>,
  document.querySelector('#stage-extras')
);
