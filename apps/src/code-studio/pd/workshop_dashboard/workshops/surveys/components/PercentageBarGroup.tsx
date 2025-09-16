import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useState} from 'react';

import {Breakdown} from '../../types';
import {COLOR_MAP, ColorMapKey} from '../constants';

import styles from './PercentageBarGroupStyles.module.scss';
import commonStyles from '../../workshop.module.scss';

interface PercentageBarGroupProps {
  items: Breakdown[];
  barLabel?: string;
  className?: string;
}

interface PercentageBarProps {
  label: string;
  count: number;
  percentage: number;
  color?: ColorMapKey;
}

const normalizeString = (s: string): string =>
  s.toLowerCase().replace(/\s+/g, '-');

export const PercentageBarGroup: FC<PercentageBarGroupProps> = ({
  items,
  barLabel,
  className,
}) => {
  return (
    <Box className={classNames(commonStyles.column, className)}>
      {items.map(item => (
        <Box key={item.label}>
          <BodyThreeText noMargin id={normalizeString(item.label)}>
            <StrongText>{item.label}</StrongText>
          </BodyThreeText>
          <Box className={styles.barRow}>
            <PercentageBar
              percentage={item.percentage}
              color={item.color}
              count={item.count}
              label={item.label}
            />
            <BodyThreeText noMargin className={styles.barLabel}>{`${
              item.count
            }${barLabel ? ` ${barLabel}` : ''}`}</BodyThreeText>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const PercentageBar: FC<PercentageBarProps> = ({
  label,
  count,
  percentage,
  color = 'teal',
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // A tiny delay ensures the browser has painted the initial 0% width
    // before transitioning to the final percentage.
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 10);

    return () => clearTimeout(timer);
  }, [percentage]);

  const fillColor = COLOR_MAP.get(color);

  return (
    <Box className={styles.barContainer}>
      <Box
        className={styles.indicator}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(width.toFixed(2))}
        aria-labelledby={normalizeString(label)}
        aria-valuetext={`${percentage}% — ${count} responses`}
        sx={{
          width: `${width}%`,
          backgroundColor: fillColor,
        }}
      />
    </Box>
  );
};
