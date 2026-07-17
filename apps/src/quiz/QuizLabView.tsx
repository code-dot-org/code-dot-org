// Quiz
//
// This is a React client for a quiz level. Note that this is
// only used for levels that use Lab2.
//
// Rendering and submission both go through SurveyJS's own runtime
// (survey-react), the same way apps/src/code-studio/pd/foorm/Foorm.jsx
// already does — no hand-built question rendering here. `levelProperties`
// only ever needs to change what SurveyJS renders (survey-react is not
// wired into our design-system components), so if we later replace the
// renderer, this is the one file that changes; the data format
// (`surveyJson`, assembled server-side from `question_type`/`survey_element`)
// stays the same either way.

import React, {useMemo, useState} from 'react';
import * as Survey from 'survey-react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {LabProps} from '../lab2/types';

import {QuizLevelProperties} from './types';

// Loads SurveyJS's default theme CSS. Without this, Survey.Survey renders
// bare, unstyled HTML — same as apps/src/code-studio/pd/foorm/Foorm.jsx does
// in its constructor.
Survey.StylesManager.applyTheme('default');

const QuizLabView: React.FunctionComponent<LabProps<QuizLevelProperties>> = ({
  levelProperties,
}) => {
  const {id: levelId, surveyJson, scriptId} = levelProperties;
  const [submitStatus, setSubmitStatus] = useState<
    'unsubmitted' | 'submitting' | 'submitted' | 'error'
  >('unsubmitted');

  const surveyModel = useMemo(
    () => surveyJson && new Survey.Model(surveyJson),
    [surveyJson]
  );

  const onComplete = async (survey: Survey.SurveyModel) => {
    setSubmitStatus('submitting');
    try {
      await HttpClient.post(
        `/levels/${levelId}/quiz_responses`,
        JSON.stringify({response_data: survey.data, script_id: scriptId}),
        true,
        {'Content-Type': 'application/json'}
      );
      setSubmitStatus('submitted');
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  if (!surveyModel) {
    return <div />;
  }

  return (
    <div>
      <Survey.Survey
        model={surveyModel}
        onComplete={onComplete}
        showCompletedPage={false}
      />
      {submitStatus === 'submitting' && <p>Submitting your answers…</p>}
      {submitStatus === 'submitted' && <p>Your answers were submitted.</p>}
      {submitStatus === 'error' && (
        <p>Something went wrong submitting your answers. Please try again.</p>
      )}
    </div>
  );
};

export default QuizLabView;
