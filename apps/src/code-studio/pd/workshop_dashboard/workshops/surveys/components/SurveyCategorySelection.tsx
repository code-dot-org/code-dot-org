import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React, {FC, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import {SurveyCategorySelectionProps} from '../../types';

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
    <SegmentedButtons
      buttons={buttons}
      selectedButtonValue={selectedValue}
      onChange={handleChange}
    />
  );
};
