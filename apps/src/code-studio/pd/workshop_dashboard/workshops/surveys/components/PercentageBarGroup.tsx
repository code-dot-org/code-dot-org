import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useState} from 'react';

import {Breakdown, ColorMapKey} from '../../../WorkshopFormTemplate/types';
import {COLOR_MAP} from '../constants';

import styles from './PercentageBarGroupStyles.module.scss';
import commonStyles from '../../workshop.module.scss';

interface PercentageBarGroupProps {
  items: Breakdown[];
  barLabel?: string;
  className?: string;
}

interface PercentageBarProps {
  percentage: number;
  color?: ColorMapKey;
}

export const PercentageBarGroup: FC<PercentageBarGroupProps> = ({
  items,
  barLabel,
  className,
}) => {
  return (
    <Box className={classNames(commonStyles.column, className)}>
      {items.map(item => (
        <Box key={item.label}>
          <BodyThreeText noMargin>
            <StrongText>{item.label}</StrongText>
          </BodyThreeText>
          <Box className={styles.barRow}>
            <PercentageBar percentage={item.percentage} color={item.color} />
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
        sx={{
          width: `${width}%`,
          backgroundColor: fillColor,
        }}
      />
    </Box>
  );
};
