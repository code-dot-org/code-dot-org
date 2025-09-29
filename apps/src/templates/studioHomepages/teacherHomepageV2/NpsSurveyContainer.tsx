import React, {useState, useEffect} from 'react';

import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';
import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './teacherHomepage.module.scss';

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

interface questionChoice {
  value: string;
  text: string;
}

interface questionValidator {
  type: string;
  text: string;
  minCount: number;
  maxCount: number;
}

interface surveyElement {
  type: string;
  name: string;
  title: string;
  isRequired: boolean;
  requiredErrorText: string;
  rateMin?: number;
  rateMax?: number;
  minRateDescription?: string;
  maxRateDescription?: string;
  validators?: questionValidator[];
  choices?: questionChoice[];
  choicesOrder?: string;
  hasOther?: boolean;
  otherText?: string;
  otherErrorText?: string;
  visibleIf?: string;
}

interface surveyPages {
  name: string;
  elements: surveyElement[];
  title: string;
}

interface surveyQuestions {
  completedHtml: string;
  pages: surveyPages[];
  showQuestionNumbers: string;
  completeText: string;
  published: boolean;
}

interface surveyPropsInterface {
  formQuestions: surveyQuestions;
  formName: string;
  formVersion: number;
  surveyData: null; // fix this
  submitApi: string;
  submitParams: {
    simple_survey_form_id: number;
    user_id: number;
  };
}

interface responseProps {
  props: string;
}

interface NpsSurveyContainerProps {
  onCompleteCallback: () => void;
}

const NpsSurveyContainer: React.FC<NpsSurveyContainerProps> = ({
  onCompleteCallback,
}) => {
  const [surveyProps, setSurveyProps] = useState<
    surveyPropsInterface | undefined
  >(undefined);

  useEffect(() => {
    HttpClient.fetchJson<responseProps>('/form/nps_survey/configuration').then(
      result => {
        if (result) {
          setSurveyProps(JSON.parse(result.value.props));
        }
      }
    );
  }, []);

  const onComplete = () => {
    onCompleteCallback();
  };

  return (
    <div className={styles.container}>
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
