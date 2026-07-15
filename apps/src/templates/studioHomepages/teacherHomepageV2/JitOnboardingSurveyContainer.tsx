import React, {useMemo} from 'react';

import loadable from '@cdo/apps/util/loadable';

const LoadableFoorm = loadable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => import('@cdo/apps/code-studio/pd/foorm/Foorm' as any)
);

const customCssClasses = {
  root: 'jit-onboarding-survey-root',
  question: {
    title: 'jit-onboarding-survey-q-title',
  },
  rating: {
    item: 'jit-onboarding-survey-q-rating-item',
    minText: 'jit-onboarding-survey-rating-min',
    maxText: 'jit-onboarding-survey-rating-max',
    root: 'jit-onboarding-survey-rating-root',
    selected: 'jit-onboarding-survey-rating-selected',
  },
  row: 'jit-onboarding-survey-row',
  checkbox: {
    item: 'jit-onboarding-survey-checkbox',
    itemControl: 'jit-onboarding-survey-checkbox-item-control',
    materialDecorator: 'jit-onboarding-survey-checkbox-material-decorator',
    other: 'jit-onboarding-survey-comment',
  },
  error: {
    locationTop: 'jit-onboarding-survey-top-error',
  },
  navigation: {
    complete: 'jit-onboarding-survey-submit-button',
  },
  comment: 'jit-onboarding-survey-comment',
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

interface JitOnboardingSurveyContainerProps {
  surveyProps: string;
  onCompleteCallback: () => void;
}

const JitOnboardingSurveyContainer: React.FC<
  JitOnboardingSurveyContainerProps
> = ({surveyProps, onCompleteCallback}) => {
  const parsedSurveyProps: SurveyPropsInterface = useMemo(
    () => JSON.parse(surveyProps),
    [surveyProps]
  );

  return (
    <div>
      {parsedSurveyProps && (
        <LoadableFoorm
          {...parsedSurveyProps}
          customCssClasses={customCssClasses}
          onComplete={onCompleteCallback}
        />
      )}
    </div>
  );
};

export default JitOnboardingSurveyContainer;
