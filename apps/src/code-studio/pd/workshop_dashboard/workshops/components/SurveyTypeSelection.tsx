import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {ChangeEvent, FC, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import styles from '../workshop.module.scss';

export interface SurveyOption {
  text: string;
  value: string;
}

export interface SurveyTypeSelectionProps {
  surveyTypeOptions: SurveyOption[];
}

export const SurveyTypeSelection: FC<SurveyTypeSelectionProps> = ({
  surveyTypeOptions,
}) => {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  const selectedValue = useMemo(() => {
    return surveyTypeOptions.find(opt => pathname.includes(opt.value))?.value;
  }, [pathname, surveyTypeOptions]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    navigate(e.target.value, {replace: true});
  };

  return (
    <SimpleDropdown
      size="s"
      name="survey type selection"
      items={surveyTypeOptions}
      dropdownTextThickness="thin"
      labelText="Viewing results for:"
      selectedValue={selectedValue}
      onChange={handleChange}
      className={styles.navDropdown}
    />
  );
};
