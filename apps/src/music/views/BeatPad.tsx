import classNames from 'classnames';
import React from 'react';

import {Trigger} from '../constants';

import {useMusicSelector} from './types';

import styles from './beatpad.module.scss';

interface BeatPadProps {
  triggers: Trigger[];
  playTrigger: (id: string) => void;
}

/**
 * Renders the Beat Pad component, which can be used to play numbered triggers during playback
 */
const BeatPad: React.FunctionComponent<BeatPadProps> = ({
  triggers,
  playTrigger,
}) => {
  const selectedTriggerId = useMusicSelector(
    state => state.music.selectedTriggerId
  );
  const isPlaying = useMusicSelector(state => state.music.isPlaying);

  return (
    <div id="beat-pad" className={styles.triggersContainer}>
      {triggers.map(trigger => {
        return (
          <button
            type="button"
            id={trigger.id}
            key={trigger.id}
            className={classNames(
              styles.triggerButton,
              trigger.id === selectedTriggerId && styles.triggerButtonSelected,
              isPlaying && styles.triggerButtonActive
            )}
            onClick={isPlaying ? () => playTrigger(trigger.id) : undefined}
          >
            {trigger.buttonLabel}
          </button>
        );
      })}
    </div>
  );
};

export default BeatPad;
