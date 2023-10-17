import React from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import {
  BodyTwoText,
  Heading2,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';

export default function RubricSettings({canProvideFeedback, visible}) {
  return (
    <div
      className={classnames(style.settings, {
        [style.settingsVisible]: visible,
        [style.settingsHidden]: !visible,
      })}
    >
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
            // TODO: hook up call to run AI assessment
            disabled
          />
        </div>
      )}
    </div>
  );
}

RubricSettings.propTypes = {
  canProvideFeedback: PropTypes.bool,
  teacherHasEnabledAi: PropTypes.bool,
  updateTeacherAiSetting: PropTypes.func,
  visible: PropTypes.bool,
};
