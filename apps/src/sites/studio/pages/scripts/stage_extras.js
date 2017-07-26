import React from 'react';
import ReactDOM from 'react-dom';
import StageExtras from '@cdo/apps/code-studio/components/stageExtras/StageExtras';

const script = document.querySelector('script[data-extras]');
const config = JSON.parse(script.dataset.extras);
const showProjectWidget = JSON.parse(script.dataset.widgetVisible);
const projectTypes = JSON.parse(script.dataset.widgetTypes);

// Get project data if showing the project widget.
if (showProjectWidget) {
  $.ajax({
    method: 'GET',
    url: `/v3/channels`,
    dataType: 'json'
  }).done(projectLists => {
    ReactDOM.render(
      <StageExtras
        stageNumber={config.stageNumber}
        nextLevelPath={config.nextLevelPath}
        bonusLevels={config.bonusLevels}
        showProjectWidget={showProjectWidget}
        projectTypes={projectTypes}
        projectList={projectLists}
      />,
      document.querySelector('#stage-extras')
    );
  });
} else {
  ReactDOM.render(
    <StageExtras
      stageNumber={config.stageNumber}
      nextLevelPath={config.nextLevelPath}
      bonusLevels={config.bonusLevels}
      showProjectWidget={showProjectWidget}
    />,
    document.querySelector('#stage-extras')
  );
}
