import React, {useCallback, useEffect, useState} from 'react';

import {AITutorTypes as ActionType, Role} from '@cdo/apps/aiTutor/types';
import Button from '@cdo/apps/componentLibrary/button/Button';

import {askAITutor} from '../aiTutor/redux/aiTutorRedux';
import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

import ValidationResultsModal from './ValidationResultsModal';

/**
 * Renders a button in App Lab that when clicked makes a call to AI to
 * validate which of the TODOs in the student's code are incomplete,
 * partially complete or complete, and then opens a dialog displaying
 * the results.
 */

const ValidationButton: React.FunctionComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [studentCode, setStudentCode] = useState('');
  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);
  const [aiResponse, setAiResponse] = useState<string | undefined>(undefined);
  const codeDOMElement = document.getElementsByClassName('ace_content');

  useEffect(() => {
    if (codeDOMElement.length > 0) {
      const studentCode = codeDOMElement[0] as HTMLElement;
      setStudentCode(studentCode.innerText);
    }
    const mostRecentMessage = storedMessages.at(-1);
    const aiReponse =
      mostRecentMessage && mostRecentMessage.role === Role.ASSISTANT
        ? mostRecentMessage.chatMessageText
        : undefined;
    setAiResponse(aiReponse);
  }, [codeDOMElement, storedMessages]);

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    const systemPrompt =
      'For each TODO, output "TODO" with the correct number and say "yes", "no" or "partial" to indicate whether the TODO is complete, incomplete or partially complete. For each explain why in one sentence. Do not write any code.';
    const chatContext = {
      systemPrompt,
      studentInput: `${systemPrompt} ${studentCode}`,
      studentCode,
      actionType: ActionType.COMPLETION,
    };

    dispatch(askAITutor(chatContext));
  }, [studentCode, dispatch]);

  const onClick = () => {
    handleSubmit();
    setModalOpen(true);
  };
  const onClose = () => {
    setModalOpen(false);
  };
  return (
    <>
      <Button
        color="purple"
        text="Check my code"
        type="secondary"
        onClick={onClick}
        size="s"
      />
      {modalOpen && (
        <ValidationResultsModal onClose={onClose} aiResponse={aiResponse} />
      )}
    </>
  );
};

export default ValidationButton;
