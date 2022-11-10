import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import styles from './beatpad.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const BUTTONS_PER_ROW = 3;
const enabledClasses = [
  styles.purple,
  styles.strawberry,
  styles.orange,
  styles.yellow,
  styles.green,
  styles.teal
];

const BeatPad = ({triggers, playTrigger, onClose, isPlaying}) => {
  const renderTriggers = () => {
    const rows = [];

    for (let i = 0; i < triggers.length; i += BUTTONS_PER_ROW) {
      let buttons = [];
      for (let j = i; j < i + BUTTONS_PER_ROW; j++) {
        buttons.push(
          <TriggerButton
            label={triggers[j].buttonLabel}
            onClick={() => playTrigger(triggers[j].id)}
            key={triggers[j].id}
            colorClassName={classNames(isPlaying && enabledClasses[j])}
            disabled={!isPlaying}
          />
        );
      }
      rows.push(
        <div
          key={`row-${i / BUTTONS_PER_ROW}`}
          className={styles.triggerButtonRow}
        >
          {buttons}
        </div>
      );
    }

    return rows;
  };

  return (
    <div className={styles.container}>
      <div className={styles.labelContainer}>
        <p className={styles.label}>{'Beat Pad'}</p>
        <FontAwesome
          icon={'times'}
          onClick={onClose}
          className={styles.closeIcon}
        />
      </div>
      <div className={styles.triggersContainer}>{renderTriggers()}</div>
    </div>
  );
};

const TriggerButton = ({label, onClick, colorClassName, disabled}) => {
  return (
    <div
      className={classNames(styles.triggerButton, colorClassName)}
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
  disabled: PropTypes.bool
};

BeatPad.propTypes = {
  triggers: PropTypes.array.isRequired,
  playTrigger: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired
};

export default BeatPad;
