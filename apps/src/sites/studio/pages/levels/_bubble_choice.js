import React from 'react';
import {createRoot} from 'react-dom/client';

import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';

const script = document.querySelector('script[data-bubblechoice]');
const data = JSON.parse(script.dataset.bubblechoice);

let level = data.level;
level.sublevels = data.level.sublevels.map(sublevel => {
  sublevel.id = sublevel.id.toString();
  return sublevel;
});
level.id = level.id.toString();

reportTeacherReviewingStudentNonLabLevel();

const root = createRoot(document.querySelector('#bubble-choice'));
root.render(<BubbleChoice level={level} />);
