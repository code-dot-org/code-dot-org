import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import styles from './output.module.scss';

interface OutputProps {
  getOutputValue: () => number;
  toggleLimiter: (enabled: boolean) => void;
  setLimiterThreshold: (threshold: number) => void;
}

const REFRESH_INTERVAL = 100;

// Ranges
const MIN = 0;
const WARNING = 0.7; // ~ -3dB
const CLIP = 1; // 0dB
const MAX = 1.4; // ~ +3dB

function getFillPercent(value: number, start: number, limit: number) {
  if (value > limit) {
    return 100;
  }
  if (value < start) {
    return 0;
  }
  return (value / limit - start) * 100;
}

const Output: React.FunctionComponent<OutputProps> = ({
  getOutputValue,
  toggleLimiter,
  setLimiterThreshold,
}) => {
  const [level, setLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);
  const [isLimiterEnabled, setIsLimiterEnabled] = useState(false);
  const [threshold, setThreshold] = useState(-20);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const isPlaying = useAppSelector(state => state.music.isPlaying);

  useEffect(() => {
    if (!isPlaying) {
      setLevel(0);
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    } else {
      setMaxLevel(0);
      intervalId.current = setInterval(() => {
        setLevel(getOutputValue());
      }, REFRESH_INTERVAL);
    }
  }, [isPlaying, getOutputValue]);

  useEffect(() => {
    setMaxLevel(maxLevel => Math.max(maxLevel, level));
  }, [level]);

  useEffect(() => {
    toggleLimiter(isLimiterEnabled);
  }, [isLimiterEnabled, toggleLimiter]);

  useEffect(() => {
    setLimiterThreshold(threshold);
  }, [threshold, setLimiterThreshold]);

  const safeFillPercent = getFillPercent(level, MIN, WARNING);
  const warningFillPercent = getFillPercent(level, WARNING, CLIP);
  const clipFillPercent = getFillPercent(level, CLIP, MAX);

  const dBValue = maxLevel === 0 ? undefined : 20 * Math.log10(maxLevel);
  const safeMaxAmount = getFillPercent(maxLevel, MIN, WARNING);
  const warningMaxAmount = getFillPercent(maxLevel, WARNING, CLIP);
  const clipMaxAmount = getFillPercent(maxLevel, CLIP, MAX);
  // Meter ranges are scaled at different rates for display.
  const maxLevelPosition =
    safeMaxAmount * (2 / 3) +
    warningMaxAmount * (1 / 6) +
    clipMaxAmount * (1 / 6);

  return (
    <div className={styles.container}>
      <div className={styles.meter}>
        <div className={styles.marks}>
          <div className={styles.maxMark}>+3</div>
          <div className={styles.clipMark}>0</div>
          <div className={styles.warningMark}>-3</div>
        </div>
        <div className={styles.bars}>
          {[
            ['clip', clipFillPercent],
            ['warning', warningFillPercent],
            ['safe', safeFillPercent],
          ].map(([name, fillPercent]) => {
            return (
              <div key={name} className={styles[`${name}Zone`]}>
                <div
                  className={styles[`${name}Fill`]}
                  style={{height: `${fillPercent}%`}}
                />
              </div>
            );
          })}
        </div>
        <div className={styles.readout}>
          {dBValue && (
            <div
              className={classNames(
                styles.readoutValue,
                maxLevel > CLIP
                  ? styles.readoutValueClip
                  : maxLevel > WARNING
                  ? styles.readoutValueWarning
                  : ''
              )}
              style={{bottom: `${maxLevelPosition}%`}}
              onClick={() => setMaxLevel(0)}
            >
              <FontAwesomeV6Icon iconName="caret-left" />
              {dBValue.toFixed(1)}dB
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames(
          styles.limiterArea,
          !isLimiterEnabled && styles.limiterAreaDisabled
        )}
      >
        <Checkbox
          size="s"
          checked={isLimiterEnabled}
          onChange={() => setIsLimiterEnabled(!isLimiterEnabled)}
          name="limiter-toggle"
          label="Limiter"
          className={styles.limiterToggle}
        />
        <div className={styles.limiterThreshold}>
          <p>Threshold:</p>
          <input
            type="number"
            value={threshold}
            min={-50}
            max={0}
            onChange={event => setThreshold(parseInt(event.target.value))}
            disabled={!isLimiterEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default Output;
