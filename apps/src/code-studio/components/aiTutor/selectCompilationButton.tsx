import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {setSelectedTutorType} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {TutorType} from '@cdo/apps/aiTutor/types';

const SelectCompilationButton: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(setSelectedTutorType(TutorType.COMPILATION));
  };

  return (
    <Button
      color={Button.ButtonColor.brandSecondaryDefault}
      icon={'exclamation-triangle'}
      key="compilation"
      onClick={() => onClick()}
      size={Button.ButtonSize.default}
      text="Code errors"
    />
  );
};

export default SelectCompilationButton;
