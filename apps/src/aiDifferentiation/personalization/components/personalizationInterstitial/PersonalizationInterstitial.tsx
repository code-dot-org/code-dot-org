import {Heading5} from '@code-dot-org/component-library/typography';
import React from 'react';

import {PersonalizationData} from '../../../hooks/useTeachingProfileData';
import {PersonalizationQuestionType} from '../personalizationQuestion/personalizationQuestions';

import robotProcessing from './../../images/robot_processing.gif';
import {
  PERSONALIZATION_INTERSTITIALS,
  getInterstitialMessage,
} from './personalizationInterstitials';

import style from '../../personalization-information.module.scss';

type PersonalizationInterstitialProps = {
  currentQuestion: PersonalizationQuestionType;
  personalizationData: PersonalizationData;
};

const PersonalizationInterstitial: React.FC<
  PersonalizationInterstitialProps
> = ({currentQuestion, personalizationData}) => {
  // Map question order → interstitial id
  const interstitial = PERSONALIZATION_INTERSTITIALS.find(
    i => i.id === currentQuestion.id
  );

  if (!interstitial) return null;

  // Determine the relevant value for conditional logic
  const value =
    interstitial.id === 'yearsTeaching'
      ? personalizationData.yearsTeaching
      : interstitial.id === 'confidence'
      ? personalizationData.selectedConfidence
      : undefined;

  const message = getInterstitialMessage(interstitial.id, value);

  return (
    <div className={style.personalizationInterstitial}>
      {interstitial.id === 'challenge' ? (
        <img
          className={style.robotProcessingAnimation}
          src={robotProcessing}
          alt=""
        />
      ) : (
        <div className={style.iconCard}>
          <div className={style.iconContainer}>
            <img src={interstitial.icon} alt="" />
          </div>
        </div>
      )}

      <Heading5 noMargin className={style.interstitialMessage}>
        {message}
      </Heading5>
    </div>
  );
};

export default PersonalizationInterstitial;
