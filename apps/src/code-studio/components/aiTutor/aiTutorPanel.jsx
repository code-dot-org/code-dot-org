import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './ai-tutor.module.scss';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
const icon = require('@cdo/static/ai-bot.png');

const AITutorPanel = props => {
  const {level} = props;
  const isCodingLevel = level.type === 'Javalab';

  const initialCheckboxes = [
    {
      key: 'compilation',
      label: 'Code compilation',
      checked: false,
      hidden: !isCodingLevel,
    },
    {
      key: 'validation',
      label: 'Failing tests',
      checked: false,
      hidden: !level.hasValidation,
    },
    {
      key: 'question',
      label: 'I have a question',
      checked: false,
      hidden: false,
    },
  ];

  const [checkboxes, updateCheckboxes] = useState(initialCheckboxes);

  const handleCheckboxChange = key => {
    const updatedCheckboxes = checkboxes.map(checkbox =>
      checkbox.key === key
        ? {...checkbox, checked: !checkbox.checked}
        : {...checkbox, checked: false}
    );
    updateCheckboxes(updatedCheckboxes);
  };

  const getChecked = checkboxes => {
    return checkboxes.find(checkbox => checkbox.checked);
  };

  const checked = getChecked(checkboxes);
  const compilationSelected = checked && checked.key === 'compilation';
  const validationSelected = checked && checked.key === 'validation';
  const questionSelected = checked && checked.key === 'question';

  return (
    <AITutorPanelContainer>
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
                checked={cb.checked}
                onChange={() => handleCheckboxChange(cb.key)}
              />
            )
        )}
      </div>
      {compilationSelected && <CompilationTutor levelId={level.id} />}
      {validationSelected && <ValidationTutor />}
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
