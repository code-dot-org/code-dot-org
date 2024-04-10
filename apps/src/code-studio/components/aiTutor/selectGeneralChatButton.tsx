import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {setSelectedTutorType} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AITutorTypes as TutorTypes} from '@cdo/apps/aiTutor/types';

const SelectGeneralChatButton: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(setSelectedTutorType(TutorTypes.GENERAL_CHAT));
  };

  return (
    <Button
      color={Button.ButtonColor.brandSecondaryDefault}
      icon={'question'}
      key="general"
      onClick={onClick}
      size={Button.ButtonSize.default}
      text="My own question"
    />
  );
};

export default SelectGeneralChatButton;
