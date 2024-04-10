import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {setSelectedTutorType} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AITutorTypes as TutorTypes} from '@cdo/apps/aiTutor/types';

const SelectValidationButton: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(setSelectedTutorType(TutorTypes.VALIDATION));
  };

  return (
    <Button
      color={Button.ButtonColor.brandSecondaryDefault}
      icon={'check'}
      key="validation"
      onClick={onClick}
      size={Button.ButtonSize.default}
      text="Failing tests"
    />
  );
};

export default SelectValidationButton;
