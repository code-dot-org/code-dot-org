import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import i18n from '@cdo/locale';
import style from './ai-tutor.module.scss';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
import {addAIResponse} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
const icon = require('@cdo/static/ai-bot.png');

const AITutorPanel = ({level}) => {
  const dispatch = useDispatch();
  const isCodingLevel = level.type === 'Javalab';

  const checkboxes = [
    {
      key: 'compilation',
      label: 'Code compilation',
      hidden: !isCodingLevel,
    },
    {
      key: 'validation',
      label: 'Failing tests',
      hidden: !level.hasValidation,
    },
    {
      key: 'question',
      label: 'I have a question',
      hidden: false,
    },
  ];

  const [checked, updateChecked] = useState('compilation');

  const handleCheckboxChange = checked => {
    dispatch(addAIResponse(''));
    updateChecked(checked);
  };

  return (
    <AITutorPanelContainer level={level}>
      <h3 id="ai_tutor_panel">AI Tutor</h3>
      <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
      <div>
        <h4> What would you like AI Tutor to help you with?</h4>
        {checkboxes.map(
          cb =>
            !cb.hidden && (
              <Checkbox
                key={cb.key}
                label={cb.label}
                checked={cb.key === checked}
                onChange={() => handleCheckboxChange(cb.key)}
              />
            )
        )}
      </div>
      {
        {
          compilation: <CompilationTutor levelId={level.id} />,
          validation: <ValidationTutor levelId={level.id} />,
          question: <GeneralChatTutor />,
        }[checked]
      }
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
