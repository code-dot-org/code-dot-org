import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {ChangeEvent, FC, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {WorkshopFacilitator} from '../types';

import styles from '../workshop.module.scss';

export const FacilitatorSelection: FC<{
  facilitators?: WorkshopFacilitator[];
}> = ({facilitators}) => {
  const {facilitatorId} = useParams();
  const navigate = useNavigate();

  const facilitatorOptions = useMemo(
    () =>
      facilitators?.map(({id, name}) => ({
        value: `surveys/post/facilitators/${id}`,
        text: name,
      })) ?? [],
    [facilitators]
  );

  const selectedValue = useMemo(
    () =>
      facilitatorOptions.find(
        opt => opt.value === `surveys/post/facilitators/${facilitatorId}`
      )?.value ?? facilitatorOptions[0]?.value,
    [facilitatorId, facilitatorOptions]
  );

  useEffect(() => {
    if (!facilitatorId && selectedValue) {
      navigate(selectedValue, {replace: true});
    }
  }, [facilitatorId, navigate, selectedValue]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    navigate(e.target.value, {replace: true});
  };

  return (
    <div>
      <SimpleDropdown
        size="s"
        name="facilitator selection"
        items={facilitatorOptions}
        dropdownTextThickness="thin"
        labelText="Viewing feedback for:"
        selectedValue={selectedValue}
        onChange={handleChange}
        iconLeft={{iconName: 'user'}}
        className={styles.navDropdown}
      />
    </div>
  );
};
