import React from 'react';
import ReactDOM from 'react-dom';
import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';

const script = document.querySelector('script[data-bubblechoice]');
const data = JSON.parse(script.dataset.bubblechoice);

let level = data.level;
level.sublevels = data.level.sublevels.map(sublevel => {
  sublevel.id = sublevel.id.toString();
  return sublevel;
});
level.id = level.id.toString();

ReactDOM.render(
  <BubbleChoice level={level} />,
  document.querySelector('#bubble-choice')
);
