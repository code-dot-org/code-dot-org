import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React, {FC, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import {SurveyCategorySelectionProps} from '../../types';

import styles from '../../workshop.module.scss';

export const SurveyCategorySelection: FC<SurveyCategorySelectionProps> = ({
  buttons,
}) => {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  const selectedValue = useMemo(
    () => buttons.find(button => pathname.includes(button.value))?.value ?? '',
    [pathname, buttons]
  );

  const handleChange = (value: string) => {
    navigate(value, {replace: true});
  };

  return (
    <div className={styles.categorySelectionContainer}>
      <span>Dashboard view:</span>
      <SegmentedButtons
        size="s"
        buttons={buttons}
        selectedButtonValue={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};
