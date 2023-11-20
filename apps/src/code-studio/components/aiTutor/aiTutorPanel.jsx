import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './ai-tutor.module.scss';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationAssistant from './compilationAssistant';
const icon = require('@cdo/static/ai-bot.png');

export default class AITutorPanel extends React.Component {
  static propTypes = {
    level: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }),
  };

  render() {
    const {level} = this.props;
    const isCodingLevel = level.type === 'Javalab';

    return (
      <AITutorPanelContainer level={level}>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
        {isCodingLevel && <CompilationAssistant levelId={level.id} />}
      </AITutorPanelContainer>
    );
  }
}
