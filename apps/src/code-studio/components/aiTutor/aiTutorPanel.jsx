import React from 'react';
import PropTypes from 'prop-types';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationAssistant from './compilationAssistant';
import ValidationAssistant from './validationAssistant';

// Container component for AI Tutor tools: Compilation Assistant, Validation Assistant and General Chat.
export default class AITutorPanel extends React.Component {
  static propTypes = {
    levelType: PropTypes.string,
    isLevelValidated: PropTypes.bool,
  };

  render() {
    const {levelType, isLevelValidated} = this.props;
    const isCodingLevel = levelType === 'Javalab';

    return (
      <AITutorPanelContainer>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        {isCodingLevel && <CompilationAssistant />}
        {isLevelValidated && <ValidationAssistant />}
      </AITutorPanelContainer>
    );
  }
}
