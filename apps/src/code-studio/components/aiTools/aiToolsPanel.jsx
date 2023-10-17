import React from 'react';
import AIToolsPanelContainer from '@cdo/apps/code-studio/components/aiTools/aiToolsPanelContainer';
import CompilationAssistant from './compilationAssitant';

export default class AIToolsPanel extends React.Component {

  render() {
    const {
    } = this.props;

    return (
      <AIToolsPanelContainer >
        <h3 id="ai_tools_panel">AI Tools</h3>
        <CompilationAssistant/>
      </AIToolsPanelContainer>
    );
  }
}
