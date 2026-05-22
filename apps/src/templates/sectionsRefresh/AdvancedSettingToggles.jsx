import Toggle from '@code-dot-org/component-library/toggle';
import PropTypes from 'prop-types';
import React from 'react';

import InfoHelpTip from '@cdo/apps/sharedComponents/InfoHelpTip';
import i18n from '@cdo/locale';

import style from './sections-refresh.module.scss';

export default function AdvancedSettingToggles({updateSection, section}) {
  const handlePairProgrammingToggle = e => {
    const updatedValue = !section.pairingAllowed;
    updateSection('pairingAllowed', updatedValue);
  };

  const handleLockSectionToggle = e => {
    const updatedValue = !section.restrictSection;
    updateSection('restrictSection', updatedValue);
  };

  const handleLessonExtrasToggle = e => {
    const updatedValue = !section.lessonExtras;
    updateSection('lessonExtras', updatedValue);
  };

  const handleTtsAutoplayEnabledToggle = e => {
    const updatedValue = !section.ttsAutoplayEnabled;
    updateSection('ttsAutoplayEnabled', updatedValue);
  };

  return (
    <div>
      <div className={style.toolTipContainer}>
        <Toggle
          id={'uitest-pair-toggle'}
          checked={section.pairingAllowed}
          onChange={e => {
            handlePairProgrammingToggle(e);
          }}
          label={i18n.pairProgramming()}
        />
        <InfoHelpTip
          id={'pair-toggle-info'}
          content={i18n.explainPairProgramming()}
        />
      </div>
      <div className={style.toolTipContainer}>
        <Toggle
          id={'uitest-lock-toggle'}
          checked={section.restrictSection}
          onChange={e => {
            handleLockSectionToggle(e);
          }}
          label={i18n.restrictSectionAccess()}
        />
        <InfoHelpTip
          id={'lock-toggle-info'}
          content={i18n.explainRestrictedSectionEmailToolTip()}
        />
      </div>
      {section.course?.textToSpeechEnabled && (
        <div className={style.toolTipContainer}>
          <Toggle
            id={'uitest-tts-toggle'}
            checked={section.ttsAutoplayEnabled}
            onChange={e => handleTtsAutoplayEnabledToggle(e)}
            label={i18n.enableTtsAutoplayToggle()}
          />
          <InfoHelpTip
            id={'tts-toggle-info'}
            content={i18n.explainTtsAutoplayToolTip()}
          />
        </div>
      )}
      {section.course?.lessonExtrasAvailable && (
        <div className={style.toolTipContainer}>
          <Toggle
            id={'uitest-lesson-extras-toggle'}
            checked={section.lessonExtras}
            onChange={e => handleLessonExtrasToggle(e)}
            label={i18n.enableLessonExtrasToggle()}
          />
          <InfoHelpTip
            id={'lesson-extras-toggle-info'}
            content={i18n.explainLessonExtrasToolsTip()}
          />
        </div>
      )}
    </div>
  );
}

AdvancedSettingToggles.propTypes = {
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
};
