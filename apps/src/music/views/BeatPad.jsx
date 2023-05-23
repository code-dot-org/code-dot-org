import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import styles from './beatpad.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import musicI18n from '../locale';

const BUTTONS_PER_ROW = 4;
const enabledClasses = [
  styles.purple,
  styles.strawberry,
  styles.orange,
  styles.yellow,
  styles.green,
  styles.teal,
];

/**
 * Renders the Beat Pad component, which can be used to play numbered triggers during playback
 */
const BeatPad = ({triggers, playTrigger, onClose, isPlaying, hasTrigger}) => {
  const renderTriggers = () => {
    let buttons = [];
    for (let j = 0; j < BUTTONS_PER_ROW; j++) {
      if (hasTrigger(triggers[j].id)) {
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
    }

    return buttons;
  };

  return <div className={styles.triggersContainer}>{renderTriggers()}</div>;
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
  disabled: PropTypes.bool,
};

BeatPad.propTypes = {
  triggers: PropTypes.array.isRequired,
  playTrigger: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  hasTrigger: PropTypes.func.isRequired,
};

export default BeatPad;
