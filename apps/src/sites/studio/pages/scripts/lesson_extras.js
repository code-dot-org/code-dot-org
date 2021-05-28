import React from 'react';
import ReactDOM from 'react-dom';
import LessonExtras from '@cdo/apps/code-studio/components/lessonExtras/LessonExtras';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';

const script = document.querySelector('script[data-extras]');
const config = JSON.parse(script.dataset.extras);
const showProjectWidget = JSON.parse(script.dataset.widgetVisible);
const projectTypes = JSON.parse(script.dataset.widgetTypes);
const viewer = JSON.parse(script.dataset.viewer);
const store = getStore();

config.bonusLevels = config.bonusLevels.map(bonus => {
  bonus.levels = bonus.levels.map(level => {
    level.id = level.id.toString();
    return level;
  });
  return bonus;
});

ReactDOM.render(
  <Provider store={store}>
    <LessonExtras
      lessonNumber={config.lessonNumber}
      nextLessonNumber={config.nextStageNumber}
      nextLevelPath={config.nextLevelPath}
      bonusLevels={config.bonusLevels}
      showProjectWidget={showProjectWidget}
      projectTypes={projectTypes}
      sectionId={viewer.section_id}
      userId={viewer.user_id}
      showLessonExtrasWarning={viewer.show_stage_extras_warning}
    />
  </Provider>,
  document.querySelector('#lesson-extras')
);
