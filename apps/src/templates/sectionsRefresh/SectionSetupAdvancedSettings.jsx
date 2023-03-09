import React from 'react';
import PropTypes from 'prop-types';
//import {connect} from 'react-redux';
import i18n from '@cdo/locale';
//import moduleStyles from './sections-refresh.module.scss';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';
// import {
//   assignedUnitTextToSpeechEnabled,
//   assignedUnitLessonExtrasAvailable
// } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export default function SectionSetupAdvancedSettings({
  updateSection,
  section,
  assignedUnitTextToSpeechEnabled,
  assignedUnitLessonExtrasAvailable
}) {
  const handlePairProgrammingToggle = e => {
    e.preventDefault;
    const updatedValue = !section.pairingAllowed;
    updateSection('pairingAllowed', updatedValue);
  };

  const handleLockSectionToggle = e => {
    e.preventDefault;
    const updatedValue = !section.restrictSection;
    updateSection('restrictSection', updatedValue);
  };

  const handleLessonExtrasToggle = e => {
    e.preventDefault;
    const updatedValue = !section.lessonExtras;
    updateSection('lessonExtras', updatedValue);
  };

  const handleTtsAutoplayEnabledToggle = e => {
    e.preventDefault;
    const updatedValue = !section.ttsAutoplayEnabled;
    updateSection('ttsAutoplayEnabled', updatedValue);
  };

  return (
    <div>
      <ToggleSwitch
        isToggledOn={section.pairingAllowed}
        onToggle={e => {
          handlePairProgrammingToggle(e);
        }}
        label={i18n.pairProgramming()}
      />
      <ToggleSwitch
        isToggledOn={section.restrictSection}
        onToggle={e => handleLockSectionToggle(e)}
        label={i18n.restrictSectionAccess()}
      />

      {assignedUnitTextToSpeechEnabled && (
        <ToggleSwitch
          isToggledOn={section.ttsAutoplayEnabled}
          onToggle={e => handleTtsAutoplayEnabledToggle(e)}
          label={i18n.enableTtsAutoplay()}
        />
      )}
      {assignedUnitLessonExtrasAvailable && (
        <ToggleSwitch
          isToggledOn={section.lessonExtras}
          onToggle={e => handleLessonExtrasToggle(e)}
          label={i18n.enableLessonExtras()}
        />
      )}
    </div>
  );
}

SectionSetupAdvancedSettings.propTypes = {
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
  assignedUnitLessonExtrasAvailable: PropTypes.bool,
  assignedUnitTextToSpeechEnabled: PropTypes.bool
};

// let defaultPropsFromState = state => ({
//   assignedUnitLessonExtrasAvailable: assignedUnitLessonExtrasAvailable(state),
//   assignedUnitTextToSpeechEnabled: assignedUnitTextToSpeechEnabled(state)
// });

// export const UnconnectedSectionSetupAdvancedSettings = SectionSetupAdvancedSettings;

// export default connect(state => ({}))(SectionSetupAdvancedSettings);
