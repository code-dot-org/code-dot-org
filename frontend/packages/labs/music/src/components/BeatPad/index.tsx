import classNames from 'classnames';

import {useAppSelector} from '../../redux/store';
import type {Trigger} from '../../types';

import styles from './beatpad.module.scss';

export interface BeatPadProps {
  triggers: Trigger[];
  playTrigger: (id: string) => void;
}

/**
 * Renders the Beat Pad component, which can be used to play numbered triggers during playback
 */
const BeatPad = ({triggers, playTrigger}: BeatPadProps) => {
  const selectedTriggerId = useAppSelector(
    state => state.music.selectedTriggerId,
  );
  const isPlaying = useAppSelector(state => state.music.isPlaying);

  return (
    <div id="beat-pad" className={styles.triggersContainer}>
      {triggers.map(trigger => (
        <button
          type="button"
          id={trigger.id}
          key={trigger.id}
          className={classNames(
            styles.triggerButton,
            trigger.id === selectedTriggerId && styles.triggerButtonSelected,
            isPlaying && styles.triggerButtonActive,
          )}
          onClick={isPlaying ? () => playTrigger(trigger.id) : undefined}
        >
          {trigger.buttonLabel}
        </button>
      ))}
    </div>
  );
};

export default BeatPad;
