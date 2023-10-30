import React from 'react';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationAssistant from './compilationAssitant';

export default class AITutorPanel extends React.Component {
  render() {
    return (
      <AITutorPanelContainer>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        <CompilationAssistant />
      </AITutorPanelContainer>
    );
  }
}
