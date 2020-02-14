import React from 'react';
import ReactDOM from 'react-dom';
import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';
import instructions, {setTeacherMarkdown} from '@cdo/apps/redux/instructions';
import $ from 'jquery';
import {getStore, registerReducers} from '@cdo/apps/redux';

const script = document.querySelector('script[data-bubblechoice]');
const data = JSON.parse(script.dataset.bubblechoice);

$(document).ready(function() {
  registerReducers({
    instructions
  });
  const store = getStore();

  store.dispatch(setTeacherMarkdown(data.level.teacher_markdown));

  ReactDOM.render(
    <BubbleChoice level={data.level} />,
    document.querySelector('#bubble-choice')
  );
});
