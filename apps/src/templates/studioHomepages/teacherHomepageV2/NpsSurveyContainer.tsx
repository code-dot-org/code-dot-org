import React, {useMemo} from 'react';

import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';

const customCssClasses = {
  root: 'nps-survey-root',
  question: {
    title: 'nps-survey-q-title',
  },
  rating: {
    item: 'nps-survey-q-rating-item',
    minText: 'nps-survey-rating-min',
    maxText: 'nps-survey-rating-max',
    root: 'nps-survey-rating-root',
    selected: 'nps-survey-rating-selected',
  },
  row: 'nps-survey-row',
  checkbox: {
    item: 'nps-survey-checkbox',
    itemControl: 'nps-survey-checkbox-item-control',
    materialDecorator: 'nps-survey-checkbox-material-decorator',
    other: 'nps-survey-comment',
  },
  error: {
    locationTop: 'nps-survey-top-error',
  },
  navigation: {
    complete: 'nps-survey-submit-button',
  },
  comment: 'nps-survey-comment',
};

interface QuestionChoice {
  value: string;
  text: string;
}

interface QuestionValidator {
  type: string;
  text: string;
  minCount: number;
  maxCount: number;
}

interface SurveyElement {
  type: string;
  name: string;
  title: string;
  isRequired: boolean;
  requiredErrorText: string;
  rateMin?: number;
  rateMax?: number;
  minRateDescription?: string;
  maxRateDescription?: string;
  validators?: QuestionValidator[];
  choices?: QuestionChoice[];
  choicesOrder?: string;
  hasOther?: boolean;
  otherText?: string;
  otherErrorText?: string;
  visibleIf?: string;
}

interface SurveyPage {
  name: string;
  elements: SurveyElement[];
  title: string;
}

interface SurveyQuestions {
  completedHtml: string;
  pages: SurveyPage[];
  showQuestionNumbers: string;
  completeText: string;
  published: boolean;
}

interface SurveyPropsInterface {
  formQuestions: SurveyQuestions;
  formName: string;
  formVersion: number;
  surveyData: string | null;
  submitApi: string;
  submitParams: {
    simple_survey_form_id: number;
    user_id: number;
  };
}

interface NpsSurveyContainerProps {
  NPSProps: string;
  onCompleteCallback: () => void;
}

const NpsSurveyContainer: React.FC<NpsSurveyContainerProps> = ({
  NPSProps,
  onCompleteCallback,
}) => {
  const surveyProps: SurveyPropsInterface = useMemo(
    () => JSON.parse(NPSProps),
    [NPSProps]
  );

  const onComplete = () => {
    onCompleteCallback();
  };

  return (
    <div>
      {surveyProps && (
        <Foorm
          {...surveyProps}
          customCssClasses={customCssClasses}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};

export default NpsSurveyContainer;
