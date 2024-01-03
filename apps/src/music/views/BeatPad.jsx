import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import styles from './beatpad.module.scss';
import {BlockTypes} from '../blockly/blockTypes';
import {TRIGGER_FIELD} from '../blockly/constants';

const BUTTONS_PER_ROW = 4;
const enabledClasses = [
  styles.greenTrigger,
  styles.greenTrigger,
  styles.greenTrigger,
  styles.greenTrigger,
  styles.greenTrigger,
  styles.greenTrigger,
];

/**
 * Renders the Beat Pad component, which can be used to play numbered triggers during playback
 */
const BeatPad = ({triggers, playTrigger, onClose, isPlaying, hasTrigger}) => {
  const selectedBlockId = useSelector(state => state.music.selectedBlockId);
  const selectedBlock =
    selectedBlockId && Blockly.mainBlockSpace.getBlockById(selectedBlockId);
  const isSelectedBlockTriggerAt =
    selectedBlock?.type === BlockTypes.TRIGGERED_AT_SIMPLE2;
  const selectedTriggerId =
    isSelectedBlockTriggerAt && selectedBlock?.getFieldValue(TRIGGER_FIELD);

  const renderTriggers = () => {
    let buttons = [];
    for (let j = 0; j < BUTTONS_PER_ROW; j++) {
      if (hasTrigger(triggers[j].id)) {
        buttons.push(
          <TriggerButton
            label={triggers[j].buttonLabel}
            onClick={() => playTrigger(triggers[j].id)}
            key={triggers[j].id}
            colorClassName={enabledClasses[j]}
            isSelected={triggers[j].id === selectedTriggerId}
            disabled={!isPlaying}
          />
        );
      }
    }

    return buttons;
  };

  return (
    <div id="beat-pad" className={styles.triggersContainer}>
      {renderTriggers()}
    </div>
  );
};

const TriggerButton = ({
  label,
  onClick,
  colorClassName,
  isSelected,
  disabled,
}) => {
  return (
    <div
      className={classNames(
        styles.triggerButton,
        colorClassName,
        isSelected && styles.selected
      )}
      onClick={disabled ? null : onClick}
    >
      {label}
    </div>
  );
};

TriggerButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  colorClassName: PropTypes.string,
  disabled: PropTypes.bool,
  isSelected: PropTypes.bool.isRequired,
};

BeatPad.propTypes = {
  triggers: PropTypes.array.isRequired,
  playTrigger: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  hasTrigger: PropTypes.func.isRequired,
};

export default BeatPad;
