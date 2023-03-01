import React, {useState} from 'react';
import PropTypes from 'prop-types';
import MultiSelectGroup from '@cdo/apps/templates/teacherDashboard/MultiSelectGroup';
import {StudentGradeLevels} from '@cdo/apps/util/sharedConstants';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection
}) {
  const gradeOptions = StudentGradeLevels.map(g => ({label: g, value: g}));

  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const caretStyle = style.caret;
  const caret = advancedSettingsOpen ? 'caret-down' : 'caret-right';

  const toggleAdvancedSettingsOpen = () => {
    setAdvancedSettingsOpen(!advancedSettingsOpen);
  };

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
      <h2>{i18n.classSectionNum({num: sectionNum})}</h2>
      <label>
        {i18n.className()}
        <input
          type="text"
          className={moduleStyles.classNameTextField}
          value={section.name}
          onChange={e => updateSection('name', e.target.value)}
        />
      </label>
      <MultiSelectGroup
        label={i18n.chooseGrades()}
        name="grades"
        required={true}
        options={gradeOptions}
        values={section.grades || []}
        setValues={g => updateSection('grades', g)}
      />
      <hr />
      <div onClick={toggleAdvancedSettingsOpen}>
        <FontAwesome icon={caret} style={caretStyle} />
        {i18n.advancedSettings()}
      </div>
      <div>
        {advancedSettingsOpen && (
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

            {/* Eventually we want to use assignedUnitTextToSpeechEnabled to decide to show this element or not */}
            <ToggleSwitch
              isToggledOn={section.ttsAutoplayEnabled}
              onToggle={e => handleTtsAutoplayEnabledToggle(e)}
              label={i18n.enableTtsAutoplay()}
            />
            {/* Eventually we want to use assignedUnitLessonExtrasAvailable to decide to show this element or not */}
            <ToggleSwitch
              isToggledOn={section.lessonExtras}
              onToggle={e => handleLessonExtrasToggle(e)}
              label={i18n.enableLessonExtras()}
            />
          </div>
        )}
      </div>
    </div>
    // </div>
  );
}

const style = {
  caret: {
    marginRight: 10
  }
};

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
  assignedUnitLessonExtrasAvailable: PropTypes.bool.isRequired,
  assignedUnitTextToSpeechEnabled: PropTypes.bool.isRequired
};
