import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  BodyTwoText,
  Heading2,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import Toggle from '@cdo/apps/componentLibrary/toggle';

export default function RubricSettings({
  canProvideFeedback,
  teacherHasEnabledAi,
  updateTeacherAiSetting,
}) {
  const [updatingAiFeaturesSetting, setUpdatingAiFeaturesSetting] =
    useState(false);

  useEffect(() => {
    if (updatingAiFeaturesSetting) {
      // TODO request update to ai features setting
      setUpdatingAiFeaturesSetting(false);
      updateTeacherAiSetting(!teacherHasEnabledAi);
    }
  }, [updatingAiFeaturesSetting, teacherHasEnabledAi, updateTeacherAiSetting]);

  return (
    <div className={style.settings}>
      <Heading2>{i18n.settings()}</Heading2>
      {canProvideFeedback && (
        <div className={style.aiAssessmentOptions}>
          <div>
            <BodyTwoText>
              <StrongText>{i18n.aiAssessment()}</StrongText>
            </BodyTwoText>
            <BodyTwoText>{i18n.runAiAssessmentDescription()}</BodyTwoText>
          </div>
          <Button
            text={i18n.runAiAssessment()}
            color={Button.ButtonColor.brandSecondaryDefault}
            onClick={() => console.log('Run AI Asssessment Not Implemented')}
            style={{margin: 0}}
          />
        </div>
      )}
      <div className={style.aiFeaturesOptions}>
        <BodyTwoText>
          <StrongText>{i18n.artificialIntelligenceFeatures()}</StrongText>
        </BodyTwoText>
        <Toggle
          label={i18n.useAiFeatures()}
          checked={teacherHasEnabledAi}
          onChange={() => setUpdatingAiFeaturesSetting(true)}
          disabled={updatingAiFeaturesSetting}
        />
      </div>
    </div>
  );
}

RubricSettings.propTypes = {
  canProvideFeedback: PropTypes.bool,
  teacherHasEnabledAi: PropTypes.bool,
  updateTeacherAiSetting: PropTypes.func,
};
