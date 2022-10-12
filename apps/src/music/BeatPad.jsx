import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import styles from './beatpad.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const BUTTONS_PER_ROW = 3;
const colorClasses = [
  styles.purple,
  styles.strawberry,
  styles.orange,
  styles.yellow,
  styles.green,
  styles.teal
];

const BeatPad = ({triggers, playTrigger, onClose}) => {
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
            colorClassName={colorClasses[j]}
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

const TriggerButton = ({label, onClick, colorClassName}) => {
  return (
    <div
      className={classNames(styles.triggerButton, colorClassName)}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

TriggerButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  colorClassName: PropTypes.string
};

BeatPad.propTypes = {
  triggers: PropTypes.array.isRequired,
  playTrigger: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default BeatPad;
