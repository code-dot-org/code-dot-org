import React from 'react';
import ReactDOM from 'react-dom';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import * as codeStudioLevels from '../code-studio/levels/codeStudioLevels';

const styles = {
  main: {
    minHeight: 200,
  }
};

const ContainedLevel = React.createClass({
  // Note: This component modifies portions of the DOM outside of itself upon
  // mounting. This is generally considered a bad practice, and should not be
  // copied elsewhere.
  componentDidMount() {
    // dashboard provides us our contained level at #containedLevel0
    // Move it into this component once we mount.
    const container = $(ReactDOM.findDOMNode(this));
    $('#containedLevel0').appendTo(container);

    if (codeStudioLevels.hasValidContainedLevelResult()) {
      // We already have an answer, don't allow it to be changed, but allow Run
      // to be pressed so the code can be run again.
      codeStudioLevels.lockContainedLevelAnswers();
    } else {
      // No answers yet, disable Run button until there is an answer
      $('#runButton').prop('disabled', true);

      codeStudioLevels.registerAnswerChangedFn(() => {
        $('#runButton').prop('disabled', !codeStudioLevels.hasValidContainedLevelResult());
      });
    }
  },

  render() {
    return (
      <ProtectedStatefulDiv
        style={styles.main}
      />
    );
  }
});
export default ContainedLevel;
