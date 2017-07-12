import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import * as codeStudioLevels from '../code-studio/levels/codeStudioLevels';
import { setAwaitingContainedResponse } from '../redux/runState';
import locale from '@cdo/locale';
import { addCallouts } from '@cdo/apps/code-studio/callouts';

const styles = {
  main: {
    marginBottom: '10px',
  },
};

const ContainedLevel = React.createClass({
  propTypes: {
    setAwaitingContainedResponse: React.PropTypes.func.isRequired
  },

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
      let runButton = $('#runButton');
      runButton.prop('disabled', true);
      // Disabled buttons don't trigger mouse events, add a dummy element to
      // receive the click and trigger the display of the callout.
      let clickReceiver = $('<div id="clickReceiver"/>');
      let boundingClientRect = runButton.get(0).getBoundingClientRect();
      clickReceiver.css({
        height: boundingClientRect.height + 'px',
        width: boundingClientRect.width + 'px',
        position: 'absolute',
        top: 0,
      });
      $('#gameButtons').append(clickReceiver);
      clickReceiver.bind('click',
        () => $(window).trigger('attemptedRunButtonClick'));

      addCallouts([{
        id: 'disabledRunButtonCallout',
        element_id: '#runButton',
        localized_text: locale.containedLevelRunDisabledTooltip(),
        qtip_config: {
          codeStudio: {
            canReappear: true,
          },
          position: {
            my: 'top left',
            at: 'bottom center',
          },
        },
        on: 'attemptedRunButtonClick',
      }]);
      this.props.setAwaitingContainedResponse(true);

      codeStudioLevels.registerAnswerChangedFn(() => {
        // Ideally, runButton would be declaratively disabled or not based on redux
        // store state. We might be close to a point where we can do that, but
        // because runButton is also mutated outside of React (here and elsewhere)
        // we need to worry about cases where the DOM gets out of sync with the
        // React layer
        runButton.prop('disabled', !codeStudioLevels.hasValidContainedLevelResult());
        if (codeStudioLevels.hasValidContainedLevelResult()) {
          runButton.qtip('hide');
          clickReceiver.hide();
        }
        this.props.setAwaitingContainedResponse(!codeStudioLevels.hasValidContainedLevelResult());
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
export default connect(null, dispatch => ({
  setAwaitingContainedResponse(awaiting) {
    dispatch(setAwaitingContainedResponse(awaiting));
  }
}))(ContainedLevel);
