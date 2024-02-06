import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import i18n from '@cdo/locale';
import style from './ai-tutor.module.scss';
import classnames from 'classnames';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
import {addAIResponse} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
import {levelShape} from './aiTutorShapes';
const icon = require('@cdo/static/ai-bot.png');

const AITutorPanel = ({level, open, scriptId}) => {
  console.log("level in AITutorPanel", level)
  console.log("scriptId in AITutorPanel", scriptId)
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
    <div
      className={classnames(style.aiTutorPanel, {
        [style.hiddenAITutorPanel]: !open,
      })}
    >
      <h3 id="ai_tutor_panel">AI Tutor</h3>
      <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
      <div>
        <h4> What would you like AI Tutor to help you with?</h4>
        <RadioButtonsGroup
          radioButtons={radioButtons}
          onChange={() => onChange(event)}
        />
      </div>
      {compilationSelected && (
        <CompilationTutor
          levelId={level.id}
          isProjectBacked={level.isProjectBacked}
          scriptId={scriptId}
        />
      )}
      {validationSelected && (
        <ValidationTutor
          levelId={level.id}
          isProjectBacked={level.isProjectBacked}
          scriptId={scriptId}
        />
      )}
      {questionSelected && (
        <GeneralChatTutor
          levelId={level.id}
          isProjectBacked={level.isProjectBacked}
          scriptId={scriptId}
        />
      )}
    </div>
  );
};

AITutorPanel.propTypes = {
  level: levelShape,
  scriptId: PropTypes.number,
};

export default AITutorPanel;
