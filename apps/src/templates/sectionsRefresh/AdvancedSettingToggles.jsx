import PropTypes from 'prop-types';
import React from 'react';

import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import InfoHelpTip from '@cdo/apps/sharedComponents/InfoHelpTip';
import i18n from '@cdo/locale';

import style from './sections-refresh.module.scss';

export default function AdvancedSettingToggles({
  updateSection,
  section,
  hasLessonExtras,
  hasTextToSpeech,
  // aiTutorAvailable refers to whether the selected assignment has AI Tutor available,
  // i.e. have we trained AI to answer questions about that specific course or unit.
  aiTutorAvailable,
}) {
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

  const handleAITutorEnabledToggle = e => {
    const updatedValue = !section.aiTutorEnabled;
    updateSection('aiTutorEnabled', updatedValue);
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
      {hasTextToSpeech && (
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
      {hasLessonExtras && (
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
      {aiTutorAvailable && (
        <div className={style.toolTipContainer}>
          <Toggle
            id={'uitest-ai-tutor-toggle'}
            checked={section.aiTutorEnabled}
            onChange={e => handleAITutorEnabledToggle(e)}
            label={i18n.enableAITutor()}
          />
          <InfoHelpTip
            id={'ai-tutor-toggle-info'}
            content={i18n.enableAITutorTooltip()}
          />
        </div>
      )}
    </div>
  );
}

AdvancedSettingToggles.propTypes = {
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
  hasLessonExtras: PropTypes.bool,
  hasTextToSpeech: PropTypes.bool,
  aiTutorAvailable: PropTypes.bool,
};
