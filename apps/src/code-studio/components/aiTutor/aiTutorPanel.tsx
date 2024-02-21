import React, {ChangeEvent, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {commonI18n} from '@cdo/apps/types/locale';
import style from './ai-tutor.module.scss';
import classnames from 'classnames';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
import {
  AITutorState,
  addAIResponse,
} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
import TutorTypeSelector from './tutorTypeSelector';
import {TutorType} from '@cdo/apps/aiTutor/types';
const icon = require('@cdo/static/ai-bot.png');

interface AITutorPanelProps {
  open: boolean;
}

const AITutorPanel: React.FunctionComponent<AITutorPanelProps> = ({open}) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('');
  const level = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.level
  );
  const selectedTutorType = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.selectedTutorType
  );
  const isCodingLevel = level?.type === 'Javalab';
  const isAssessmentLevel = level?.isAssessment;

  const radioButtons = [
    {
      key: 'compilation',
      name: 'compilation',
      label: 'Code compilation',
      value: 'compilation',
      disabled: !isCodingLevel,
    },
    {
      key: 'validation',
      name: 'validation',
      label: 'Failing tests',
      value: 'validation',
      disabled: !level?.hasValidation,
    },
    {
      key: 'question',
      name: 'question',
      label: 'I have a question',
      value: 'question',
      disabled: false,
    },
  ];

  const compilationSelected = selectedTutorType === TutorType.COMPILATION;
  const validationSelected = selectedTutorType === TutorType.VALIDATION;
  const questionSelected = selectedTutorType === TutorType.GENERAL_CHAT;

  return (
    <div
      className={classnames(style.aiTutorPanel, {
        [style.hiddenAITutorPanel]: !open,
      })}
    >
      <h3 id="ai_tutor_panel">AI Tutor</h3>
      <img alt={commonI18n.aiBot()} src={icon} className={style.aiBotImg} />
      <div>
        {isAssessmentLevel ? (
          <h4>You don't have access on this level.</h4>
        ) : (
          <div>
            <h4> What would you like AI Tutor to help you with?</h4>
            <TutorTypeSelector />
          </div>
        )}
      </div>
      {compilationSelected && <CompilationTutor />}
      {validationSelected && <ValidationTutor />}
      {questionSelected && <GeneralChatTutor />}
    </div>
  );
};

interface AITutorPanelProps {
  open: boolean;
}

export default AITutorPanel;
