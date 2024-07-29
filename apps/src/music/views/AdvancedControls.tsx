import classNames from 'classnames';
import React, {useCallback} from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {Heading5} from '@cdo/apps/componentLibrary/typography';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {MAX_BPM, MIN_BPM} from '../constants';
import {
  setBpm,
  setKey,
  setLoopEnabled,
  setLoopEnd,
  setLoopStart,
} from '../redux/musicRedux';
import {Key} from '../utils/Notes';

import moduleStyles from './advanced-controls.module.scss';

/**
 * Displays advanced controls used only by the ToneJS player, including
 * custom BPM, custom key, and loop settings.
 *
 * Currently this is internal-only.
 */
const AdvancedControls: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const bpm = useAppSelector(state => state.music.bpm);
  const key = useAppSelector(state => state.music.key);
  const loopEnabled = useAppSelector(state => state.music.loopEnabled);
  const loopStart = useAppSelector(state => state.music.loopStart);
  const loopEnd = useAppSelector(state => state.music.loopEnd);
  const isPlaying = useAppSelector(state => state.music.isPlaying);

  const onBpmChange = useCallback(
    (bpm: number) => {
      dispatch(setBpm(bpm));
    },
    [dispatch]
  );

  const onKeyChange = useCallback(
    (key: string) => {
      dispatch(setKey(Key[key as keyof typeof Key]));
    },
    [dispatch]
  );

  const onLoopChange = useCallback(
    (checked: boolean) => {
      dispatch(setLoopEnabled(checked));
    },
    [dispatch]
  );

  const onLoopStartChange = useCallback(
    (loopStart: number) => {
      dispatch(setLoopStart(loopStart));
    },
    [dispatch]
  );

  const onLoopEndChange = useCallback(
    (loopEnd: number) => {
      dispatch(setLoopEnd(loopEnd));
    },
    [dispatch]
  );

  return (
    <div className={moduleStyles.container}>
      <Heading5 className={moduleStyles.title}>Advanced Controls</Heading5>
      <div className={moduleStyles.section}>
        <div className={moduleStyles.row}>
          <div>BPM: {bpm}</div>
        </div>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          step="5"
          value={bpm}
          onChange={event => {
            onBpmChange(Number(event.target.value));
          }}
          disabled={isPlaying}
        />
      </div>
      <div className={classNames(moduleStyles.row, moduleStyles.section)}>
        <div className={moduleStyles.rowLabel}>Key</div>
        <select
          className={moduleStyles.input}
          name="key"
          value={Key[key]}
          onChange={event => {
            onKeyChange(event.target.value);
          }}
          disabled={isPlaying}
        >
          {Object.keys(Key)
            .filter(key => isNaN(Number(key)))
            .map((key, index) => {
              return <option key={index}>{key}</option>;
            })}
        </select>
      </div>
      <div className={classNames(moduleStyles.section)}>
        <div className={moduleStyles.row}>
          <div className={moduleStyles.rowLabel}>Loop</div>
          <Checkbox
            name="loop"
            checked={loopEnabled}
            onChange={event => onLoopChange(event.target.checked)}
          />
        </div>
        <div className={moduleStyles.row}>
          <label className={moduleStyles.rowLabel} htmlFor="loopStart">
            Start:
          </label>
          <input
            className={moduleStyles.measureInput}
            name="loopStart"
            type="number"
            value={loopStart}
            min={1}
            max={loopEnd - 1}
            disabled={!loopEnabled}
            onChange={event => onLoopStartChange(Number(event.target.value))}
          />
          <label className={moduleStyles.rowLabel} htmlFor="loopEnd">
            End:
          </label>
          <input
            className={moduleStyles.measureInput}
            name="loopEnd"
            type="number"
            min={loopStart + 1}
            max={100}
            value={loopEnd}
            disabled={!loopEnabled}
            onChange={event => onLoopEndChange(Number(event.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedControls;
