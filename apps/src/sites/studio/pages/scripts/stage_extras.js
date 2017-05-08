import React from 'react';
import ReactDOM from 'react-dom';
import StageExtras from '@cdo/apps/code-studio/components/stageExtras/StageExtras';

const script = document.querySelector('script[data-extras]');
const config = JSON.parse(script.dataset.extras);

ReactDOM.render(
  <StageExtras
    stageNumber={config.stageNumber}
    nextLevelPath={config.nextLevelPath}
  />,
  document.querySelector('.stage-extras')
);
