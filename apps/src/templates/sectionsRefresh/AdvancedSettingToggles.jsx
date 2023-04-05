import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import InfoHelpTip from '@cdo/apps/lib/ui/InfoHelpTip';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';
import style from './sections-refresh.module.scss';

export default function AdvancedSettingToggles({
  updateSection,
  section,

  // these are currently hard coded into the parent component
  // TO DO: In the future we will want to make these dynamic based on the course
  assignedUnitTextToSpeechEnabled,
  assignedUnitLessonExtrasAvailable
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

  return (
    <div>
      <div className={style.toolTipContainer}>
        <ToggleSwitch
          id={'uitest-pair-toggle'}
          isToggledOn={section.pairingAllowed}
          onToggle={e => {
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
        <ToggleSwitch
          id={'uitest-lock-toggle'}
          isToggledOn={section.restrictSection}
          onToggle={e => handleLockSectionToggle(e)}
          label={i18n.restrictSectionAccess()}
        />
        <InfoHelpTip
          id={'lock-toggle-info'}
          content={i18n.explainRestrictedSectionEmailToolTip()}
        />
      </div>
      {assignedUnitTextToSpeechEnabled && (
        <div className={style.toolTipContainer}>
          <ToggleSwitch
            id={'uitest-tts-toggle'}
            isToggledOn={section.ttsAutoplayEnabled}
            onToggle={e => handleTtsAutoplayEnabledToggle(e)}
            label={i18n.enableTtsAutoplayToggle()}
          />
          <InfoHelpTip
            id={'tts-toggle-info'}
            content={i18n.explainTtsAutoplayToolTip()}
          />
        </div>
      )}
      {assignedUnitLessonExtrasAvailable && (
        <div className={style.toolTipContainer}>
          <ToggleSwitch
            id={'uitest-lesson-extras-toggle'}
            isToggledOn={section.lessonExtras}
            onToggle={e => handleLessonExtrasToggle(e)}
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
  assignedUnitLessonExtrasAvailable: PropTypes.bool,
  assignedUnitTextToSpeechEnabled: PropTypes.bool
};
