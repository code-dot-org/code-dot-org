import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {ChangeEvent, FC, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import styles from '../workshop.module.scss';

const fakeFacilitators = [
  {id: 123, name: 'Andy Bernard'},
  {id: 456, name: 'Jane Doe'},
];

export const FacilitatorSelection: FC = () => {
  const {facilitatorId} = useParams();
  const navigate = useNavigate();

  const facilitatorOptions = fakeFacilitators.map(({id, name}) => ({
    value: `surveys/post/facilitators/${id}`,
    text: name,
  }));

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
  );
};
