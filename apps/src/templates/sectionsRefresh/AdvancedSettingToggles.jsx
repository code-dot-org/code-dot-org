import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
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
        <span data-tip data-for={'pair-toggle-info'}>
          <FontAwesome icon="info-circle" className={style.infoTipIcon} />
        </span>
        <ReactTooltip
          id={'pair-toggle-info'}
          effect="solid"
          className={style.tooltip}
        >
          <p>{i18n.explainPairProgramming()}</p>
        </ReactTooltip>
      </div>
      <div className={style.toolTipContainer}>
        <ToggleSwitch
          id={'uitest-lock-toggle'}
          isToggledOn={section.restrictSection}
          onToggle={e => handleLockSectionToggle(e)}
          label={i18n.restrictSectionAccess()}
        />
        <span data-tip data-for={'lock-toggle-info'}>
          <FontAwesome icon="info-circle" className={style.infoTipIcon} />
        </span>
        <ReactTooltip
          id={'lock-toggle-info'}
          effect="solid"
          className={style.tooltip}
        >
          <p>{i18n.explainRestrictedSectionEmailToolTip()}</p>
        </ReactTooltip>
      </div>
      {assignedUnitTextToSpeechEnabled && (
        <div className={style.toolTipContainer}>
          <ToggleSwitch
            id={'uitest-tts-toggle'}
            isToggledOn={section.ttsAutoplayEnabled}
            onToggle={e => handleTtsAutoplayEnabledToggle(e)}
            label={i18n.enableTtsAutoplayToggle()}
          />
          <span data-tip data-for={'lock-toggle-info'}>
            <FontAwesome icon="info-circle" className={style.infoTipIcon} />
          </span>
          <ReactTooltip
            id={'lock-toggle-info'}
            effect="solid"
            className={style.tooltip}
          >
            <p>{i18n.explainTtsAutoplayToolTip()}</p>
          </ReactTooltip>
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
          <span data-tip data-for={'lesson-extras-toggle-info'}>
            <FontAwesome icon="info-circle" className={style.infoTipIcon} />
          </span>
          <ReactTooltip
            id={'lesson-extras-toggle-info'}
            effect="solid"
            className={style.tooltip}
          >
            <p>{i18n.explainLessonExtrasToolsTip()}</p>
          </ReactTooltip>
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
