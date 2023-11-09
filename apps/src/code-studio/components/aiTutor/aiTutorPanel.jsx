import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './ai-tutor.module.scss';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationAssistant from './compilationAssistant';
const icon = require('@cdo/static/ai-bot.png');

export default class AITutorPanel extends React.Component {
  static propTypes = {
    levelType: PropTypes.string,
  };

  render() {
    const {levelType} = this.props;
    const isCodingLevel = levelType === 'Javalab';

    return (
      <AITutorPanelContainer className={style.aiTutorContainer}>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        <img alt={i18n.aiBot()} src={icon} className={style.aiBotImg} />
        {isCodingLevel && <CompilationAssistant />}
      </AITutorPanelContainer>
    );
  }
}
