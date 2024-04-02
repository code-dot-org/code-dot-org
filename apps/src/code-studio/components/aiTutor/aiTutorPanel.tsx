import React from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {commonI18n} from '@cdo/apps/types/locale';
import style from './ai-tutor.module.scss';
import classnames from 'classnames';
import AITutor from './aiTutor';
import TutorTypeSelector from './tutorTypeSelector';
const icon = require('@cdo/static/ai-bot.png');

interface AITutorPanelProps {
  open: boolean;
}

const AITutorPanel: React.FunctionComponent<AITutorPanelProps> = ({open}) => {
  const level = useAppSelector(state => state.aiTutor.level);
  const isAssessmentLevel = level?.isAssessment;
  const aiTutorAvailable = level?.aiTutorAvailable;
  const renderAITutor = !isAssessmentLevel && aiTutorAvailable;

  return (
    <div
      className={classnames(style.aiTutorPanel, {
        [style.hiddenAITutorPanel]: !open,
      })}
    >
      <div className={classnames(style.aiTutorPanelContent)}>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        <img alt={commonI18n.aiBot()} src={icon} className={style.aiBotImg} />
        {renderAITutor ? (
          <div>
            <AITutor />
            <h4> What would you like AI Tutor to help you with?</h4>
            <TutorTypeSelector />
          </div>
        ) : (
          <h4>You don't have access on this level.</h4>
        )}
      </div>
    </div>
  );
};

interface AITutorPanelProps {
  open: boolean;
}

export default AITutorPanel;
