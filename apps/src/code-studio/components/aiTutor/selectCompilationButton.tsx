import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {addChatMessage, setSelectedTutorType} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {Role, Status, TutorType} from '@cdo/apps/aiTutor/types';

const SelectCompilationButton: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const hasCompilationError = useAppSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const hasRunOrTestedCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );

  const onClick = () => {
    dispatch(setSelectedTutorType(TutorType.COMPILATION));
    dispatch(
      addChatMessage({
        id: 1,
        role: Role.USER,
        status: Status.OK,
        chatMessageText: "Why doesn't my code compile?",
      })
    );
    if (!hasRunOrTestedCode) {
      dispatch(
        addChatMessage({
          id: 2,
          role: Role.ASSISTANT,
          status: Status.OK,
          chatMessageText: 'Run your code first and see what happens.',
        })
      );
    }
    if (hasRunOrTestedCode && !hasCompilationError) {
      dispatch(
        addChatMessage({
          id: 2,
          role: Role.ASSISTANT,
          status: Status.OK,
          chatMessageText:
            '🎉 Your code is compiling successfully. Great work!',
        })
      );
    }
    if (hasRunOrTestedCode && hasCompilationError) {
      dispatch(
        addChatMessage({
          id: 2,
          role: Role.ASSISTANT,
          status: Status.OK,
          chatMessageText:
            'Ah! You do have an error. Submit your code, and I will try to help.',
        })
      );
    }
  };

  return (
    <Button
      color={Button.ButtonColor.brandSecondaryDefault}
      icon={'exclamation-triangle'}
      key="compilation"
      onClick={onClick}
      size={Button.ButtonSize.default}
      text="Code errors"
    />
  );
};

export default SelectCompilationButton;
