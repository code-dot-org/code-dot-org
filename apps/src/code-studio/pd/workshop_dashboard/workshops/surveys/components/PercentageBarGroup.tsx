import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useState} from 'react';

import {Breakdown} from '../../../WorkshopFormTemplate/types';

import componentStyles from './PercentageBarGroupStyles.module.scss';
import commonStyles from '../../workshop.module.scss';

interface PercentageBarGroupProps {
  items: Breakdown[];
  barLabel?: string;
  className?: string;
}

interface PercentageBarProps {
  percentage: number;
  className?: string;
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
          <Box className={componentStyles.barRow}>
            <PercentageBar
              percentage={item.percentage}
              className={item.status && componentStyles[item.status]}
            />
            <BodyThreeText noMargin className={componentStyles.barLabel}>{`${
              item.count
            }${barLabel ? ` ${barLabel}` : ''}`}</BodyThreeText>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const PercentageBar: FC<PercentageBarProps> = ({percentage, className}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // A tiny delay ensures the browser has painted the initial 0% width
    // before transitioning to the final percentage.
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 10);

    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <Box className={componentStyles.barContainer}>
      <Box
        className={classNames(componentStyles.indicator, className)}
        style={{
          width: `${width}%`,
        }}
      />
    </Box>
  );
};
