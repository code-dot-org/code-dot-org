import React from 'react';
import PropTypes from 'prop-types';
import AITutorPanelContainer from '@cdo/apps/code-studio/components/aiTutor/aiTutorPanelContainer';
import CompilationAssistant from './compilationAssistant';

export default class AITutorPanel extends React.Component {
  static propTypes = {
    levelType: PropTypes.string,
  };

  render() {
    const {levelType} = this.props;
    const isCodingLevel = levelType === 'Javalab';

    return (
      <AITutorPanelContainer>
        <h3 id="ai_tutor_panel">AI Tutor</h3>
        {isCodingLevel && <CompilationAssistant />}
      </AITutorPanelContainer>
    );
  }
}
