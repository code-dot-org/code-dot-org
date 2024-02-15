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
  const isCodingLevel = level?.type === 'Javalab';

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

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    dispatch(addAIResponse(''));
    setSelected(e.target.value);
  };

  const compilationSelected = selected === 'compilation';
  const validationSelected = selected === 'validation';
  const questionSelected = selected === 'question';

  return (
    <div
      className={classnames(style.aiTutorPanel, {
        [style.hiddenAITutorPanel]: !open,
      })}
    >
      <div className={classnames(style.aiTutorPanelContent)}>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        <img alt={commonI18n.aiBot()} src={icon} className={style.aiBotImg} />
        <div>
          <h4> What would you like AI Tutor to help you with?</h4>
          <RadioButtonsGroup radioButtons={radioButtons} onChange={onChange} />
        </div>
        {compilationSelected && <CompilationTutor />}
        {validationSelected && <ValidationTutor />}
        {questionSelected && <GeneralChatTutor />}
      </div>
    </div>
  );
};

interface AITutorPanelProps {
  open: boolean;
}

export default AITutorPanel;
