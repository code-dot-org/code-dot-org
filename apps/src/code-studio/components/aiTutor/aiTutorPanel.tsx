import React, {ChangeEvent, useState} from 'react';
import {useDispatch} from 'react-redux';
import {commonI18n} from '@cdo/apps/types/locale';
import style from './ai-tutor.module.scss';
import classnames from 'classnames';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
import {addAIResponse} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
import {Level} from '@cdo/apps/aiTutor/types';
const icon = require('@cdo/static/ai-bot.png');

const AITutorPanel: React.FunctionComponent<AITutorPanelProps> = ({
  level,
  open,
}) => {
  const dispatch = useDispatch();
  const isCodingLevel = level.type === 'Javalab';
  const [selected, setSelected] = useState('');

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
      disabled: !level.hasValidation,
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
      <h3 id="ai_tutor_panel">AI Tutor</h3>
      <img alt={commonI18n.aiBot()} src={icon} className={style.aiBotImg} />
      <div>
        <h4> What would you like AI Tutor to help you with?</h4>
        <RadioButtonsGroup radioButtons={radioButtons} onChange={onChange} />
      </div>
      {compilationSelected && <CompilationTutor levelId={level.id} />}
      {validationSelected && <ValidationTutor levelId={level.id} />}
      {questionSelected && <GeneralChatTutor />}
    </div>
  );
};

interface AITutorPanelProps {
  level: Level;
  open: boolean;
}

export default AITutorPanel;
