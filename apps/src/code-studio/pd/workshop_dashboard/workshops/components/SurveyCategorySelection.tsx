import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import React, {FC, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import styles from '../workshop.module.scss';

export interface SurveyCategorySelectionProps {
  questionCategoryButtons: SegmentedButtonsProps['buttons'];
}

export const SurveyCategorySelection: FC<SurveyCategorySelectionProps> = ({
  questionCategoryButtons,
}) => {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  const selectedValue = useMemo(
    () =>
      questionCategoryButtons.find(button => pathname.includes(button.value))
        ?.value ?? '',
    [pathname, questionCategoryButtons]
  );

  const handleChange = (value: string) => {
    navigate(value, {replace: true});
  };

  return (
    <div className={styles.categorySelectionContainer}>
      <span>Dashboard view:</span>
      <SegmentedButtons
        size="s"
        buttons={questionCategoryButtons}
        selectedButtonValue={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};
