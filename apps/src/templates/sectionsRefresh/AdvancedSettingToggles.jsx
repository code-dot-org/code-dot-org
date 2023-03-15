import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';

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
      <ToggleSwitch
        id={'uitest-pair-toggle'}
        isToggledOn={section.pairingAllowed}
        onToggle={e => {
          handlePairProgrammingToggle(e);
        }}
        label={i18n.pairProgramming()}
      />
      <ToggleSwitch
        id={'uitest-lock-toggle'}
        isToggledOn={section.restrictSection}
        onToggle={e => handleLockSectionToggle(e)}
        label={i18n.restrictSectionAccess()}
      />
      {assignedUnitTextToSpeechEnabled && (
        <ToggleSwitch
          id={'uitest-tts-toggle'}
          isToggledOn={section.ttsAutoplayEnabled}
          onToggle={e => handleTtsAutoplayEnabledToggle(e)}
          label={i18n.enableTtsAutoplay()}
        />
      )}
      {assignedUnitLessonExtrasAvailable && (
        <ToggleSwitch
          id={'uitest-lesson-extras-toggle'}
          isToggledOn={section.lessonExtras}
          onToggle={e => handleLessonExtrasToggle(e)}
          label={i18n.enableLessonExtras()}
        />
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
