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
      color={Button.ButtonColor.white}
      icon={'clipboard'}
      key="compilation"
      onClick={onClick}
      size={Button.ButtonSize.small}
      text="Help me with code errors"
    />
  );
};

export default SelectCompilationButton;
