import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import i18n from '@cdo/locale';
import style from './ai-tutor.module.scss';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
import {addAIResponse} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
const icon = require('@cdo/static/ai-bot.png');

const AITutorPanel = ({level}) => {
  const dispatch = useDispatch();
  const isCodingLevel = level.type === 'Javalab';

  const [selected, setSelected] = useState('');

  const radioButtons = [
    {
      name: 'compilation',
      label: 'Code compilation',
      value: 'compilation',
      disabled: !isCodingLevel,
    },
    {
      key: 'validation',
      label: 'Failing tests',
      value: 'validation',
      disabled: !level.hasValidation,
    },
    {
      key: 'question',
      label: 'I have a question',
      value: 'question',
      disabled: false,
    },
  ];

  const onChange = event => {
    dispatch(addAIResponse(''));
    setSelected(event.target.value);
  };

  const compilationSelected = selected === 'compilation';
  const validationSelected = selected === 'validation';
  const questionSelected = selected === 'question';

  return (
    <AITutorPanelContainer level={level}>
      <h3 id="ai_tutor_panel">AI Tutor</h3>
      <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
      <div>
        <h4> What would you like AI Tutor to help you with?</h4>
        <RadioButtonsGroup
          radioButtons={radioButtons}
          onChange={() => onChange(event)}
        />
      </div>
      {compilationSelected && <CompilationTutor levelId={level.id} />}
      {validationSelected && <ValidationTutor levelId={level.id} />}
      {questionSelected && <GeneralChatTutor />}
    </AITutorPanelContainer>
  );
};

AITutorPanel.propTypes = {
  level: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    hasValidation: PropTypes.bool,
  }),
};

export default AITutorPanel;
