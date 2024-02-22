import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {setSelectedTutorType} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {TutorType} from '@cdo/apps/aiTutor/types';

const SelectGeneralChatButton: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(setSelectedTutorType(TutorType.GENERAL_CHAT));
  };

  return (
    <Button
      color={Button.ButtonColor.brandSecondaryDefault}
      icon={'question'}
      key="validation"
      onClick={onClick}
      size={Button.ButtonSize.default}
      text="My own question"
    />
  );
};

export default SelectGeneralChatButton;
