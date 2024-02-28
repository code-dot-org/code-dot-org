import React from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {commonI18n} from '@cdo/apps/types/locale';
import style from './ai-tutor.module.scss';
import classnames from 'classnames';
import CompilationTutor from './compilationTutor';
import ValidationTutor from './validationTutor';
import GeneralChatTutor from './generalChatTutor';
import TutorTypeSelector from './tutorTypeSelector';
import {TutorType} from '@cdo/apps/aiTutor/types';
const icon = require('@cdo/static/ai-bot.png');

interface AITutorPanelProps {
  open: boolean;
}

const AITutorPanel: React.FunctionComponent<AITutorPanelProps> = ({open}) => {
  const level = useAppSelector(state => state.aiTutor.level);
  const selectedTutorType = useAppSelector(
    state => state.aiTutor.selectedTutorType
  );
  const isAssessmentLevel = level?.isAssessment;

  const compilationSelected = selectedTutorType === TutorType.COMPILATION;
  const validationSelected = selectedTutorType === TutorType.VALIDATION;
  const questionSelected = selectedTutorType === TutorType.GENERAL_CHAT;

  return (
    <div
      className={classnames(style.aiTutorPanel, {
        [style.hiddenAITutorPanel]: !open,
      })}
    >
      <div className={classnames(style.aiTutorPanelContent)}>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        <img alt={commonI18n.aiBot()} src={icon} className={style.aiBotImg} />
        {isAssessmentLevel ? (
          <h4>You don't have access on this level.</h4>
        ) : (
          <div>
            <h4> What would you like AI Tutor to help you with?</h4>
            <TutorTypeSelector />
          </div>
        )}
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
