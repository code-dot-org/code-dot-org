import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {addChatMessage, setSelectedTutorType} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {Role, Status, TutorType} from '@cdo/apps/aiTutor/types';

const SelectCompilationButton: React.FunctionComponent = () => {
  const state = useAppSelector(state => state);
  console.log("state", state)
  const dispatch = useAppDispatch();
  const sources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );
  const studentCode = sources[fileMetadata[activeTabKey]].text;
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
        status: Status.UNKNOWN,
        chatMessageText: "Why doesn't my code compile?",
      })
    );
    if (!hasRunOrTestedCode) {
      dispatch(
        addChatMessage({
          id: 2,
          role: Role.ASSISTANT,
          status: Status.UNKNOWN,
          chatMessageText: 'Run your code first and see what happens.',
        })
      );
    }
    if (hasRunOrTestedCode && !hasCompilationError) {
      dispatch(
        addChatMessage({
          id: 2,
          role: Role.ASSISTANT,
          status: Status.UNKNOWN,
          chatMessageText:
            '🎉 Your code is compiling successfully. Great work!',
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
