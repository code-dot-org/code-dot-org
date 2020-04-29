/**
 * A react component for rendering a set of buttons that control what the
 * interpreter/debugger are doing. i.e. step in/out/over code and pause/continue
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {actions, selectors} from './redux';
import trackEvent from '../../../util/trackEvent';

export default connect(
  state => ({
    isAttached: selectors.isAttached(state),
    isPaused: selectors.isPaused(state),
    canRunNext: selectors.canRunNext(state)
  }),
  {
    stepIn: actions.stepIn,
    stepOver: actions.stepOver,
    stepOut: actions.stepOut,
    togglePause: actions.togglePause
  }
)(
  class DebugButtons extends React.Component {
    static propTypes = {
      style: PropTypes.object,

      // from redux
      stepIn: PropTypes.func.isRequired,
      stepOut: PropTypes.func.isRequired,
      stepOver: PropTypes.func.isRequired,
      togglePause: PropTypes.func.isRequired,
      isPaused: PropTypes.bool.isRequired,
      isAttached: PropTypes.bool.isRequired,
      canRunNext: PropTypes.bool.isRequired
    };

    // Wrap button actions to add tracking of presses to investigate student use
    togglePause() {
      trackEvent('debug_commands', 'debug_button_press', 'toggle_pause');
      this.props.togglePause();
    }

    stepIn() {
      trackEvent('debug_commands', 'debug_button_press', 'step_in');
      this.props.stepIn();
    }

    stepOut() {
      trackEvent('debug_commands', 'debug_button_press', 'step_out');
      this.props.stepOut();
    }

    stepOver() {
      trackEvent('debug_commands', 'debug_button_press', 'step_over');
      this.props.stepOver();
    }

    render() {
      const {isAttached, isPaused, canRunNext} = this.props;
      return (
        <div
          id="debug-commands"
          className="debug-commands"
          style={this.props.style}
        >
          <div id="debug-buttons">
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <button
              type="button"
              id="pauseButton"
              className="debugger_button"
              onClick={this.togglePause}
              style={{display: canRunNext ? 'none' : 'inline-block'}}
              disabled={!isAttached}
            >
              <img src="/blockly/media/1x1.gif" className="pause-btn icon21" />
              {i18n.pause()}
            </button>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <button
              type="button"
              id="continueButton"
              className="debugger_button"
              onClick={this.togglePause}
              style={{display: canRunNext ? 'inline-block' : 'none'}}
            >
              <img
                src="/blockly/media/1x1.gif"
                className="continue-btn icon21"
              />
              {i18n.continue()}
            </button>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <button
              type="button"
              id="stepOverButton"
              className="debugger_button"
              onClick={this.stepOver}
              disabled={!isPaused || !isAttached}
            >
              <img
                src="/blockly/media/1x1.gif"
                className="step-over-btn icon21"
              />
              {i18n.stepOver()}
            </button>

            <button
              type="button"
              id="stepOutButton"
              className="debugger_button"
              onClick={this.stepOut}
              disabled={!isPaused || !isAttached}
            >
              <img
                src="/blockly/media/1x1.gif"
                className="step-out-btn icon21"
              />
              {i18n.stepOut()}
            </button>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <button
              type="button"
              id="stepInButton"
              className="debugger_button"
              onClick={this.stepIn}
              disabled={!isPaused && isAttached}
            >
              <img
                src="/blockly/media/1x1.gif"
                className="step-in-btn icon21"
              />
              {i18n.stepIn()}
            </button>
          </div>
        </div>
      );
    }
  }
);
