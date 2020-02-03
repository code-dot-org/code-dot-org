import React from 'react';
import ReactDOM from 'react-dom';
import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';

const script = document.querySelector('script[data-bubblechoice]');
const data = JSON.parse(script.dataset.bubblechoice);

ReactDOM.render(
  <BubbleChoice level={data.level} />,
  document.querySelector('#bubble-choice')
);
