import React from 'react';

import QuizQuestionAuthor from '@cdo/apps/quiz/authoring/QuizQuestionAuthor';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const {quizId, questions} = getScriptData('props');

  createReactRoot(
    <QuizQuestionAuthor quizId={quizId} initialQuestions={questions} />,
    document.getElementById('quiz-question-author'),
    {legacyReactDomRender: true}
  );
});
