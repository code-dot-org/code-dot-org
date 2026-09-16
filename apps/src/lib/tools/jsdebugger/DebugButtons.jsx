/**
 * A react component for rendering a set of buttons that control what the
 * interpreter/debugger are doing. i.e. step in/out/over code and pause/continue
 */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {actions, selectors} from './redux';

import moduleStyles from './DebugButtons.module.scss';

export default connect(
  state => ({
    isAttached: selectors.isAttached(state),
    isPaused: selectors.isPaused(state),
    isEditWhileRun: selectors.isEditWhileRun(state),
    canRunNext: selectors.canRunNext(state),
  }),
  {
    stepIn: actions.stepIn,
    stepOver: actions.stepOver,
    stepOut: actions.stepOut,
    togglePause: actions.togglePause,
  }
)(
  class DebugButtons extends React.Component {
    static propTypes = {
      style: PropTypes.object,
      userInteracted: PropTypes.bool,

      // from redux
      stepIn: PropTypes.func.isRequired,
      stepOut: PropTypes.func.isRequired,
      stepOver: PropTypes.func.isRequired,
      togglePause: PropTypes.func.isRequired,
      isPaused: PropTypes.bool.isRequired,
      isEditWhileRun: PropTypes.bool.isRequired,
      isAttached: PropTypes.bool.isRequired,
      canRunNext: PropTypes.bool.isRequired,
    };

    // Wrap button actions to add tracking of presses to investigate student use
    // userInteracted tracks if the user has open/adjusted the debug console
    togglePause = () => {
      this.props.togglePause();
    };

    stepIn = () => {
      this.props.stepIn();
    };

    stepOut = () => {
      this.props.stepOut();
    };

    stepOver = () => {
      this.props.stepOver();
    };

    render() {
      const {isAttached, isPaused, canRunNext, isEditWhileRun} = this.props;
      return (
        <div
          id="debug-commands"
          className="debug-commands"
          style={this.props.style}
        >
          <div
            id="debug-buttons"
            className={moduleStyles.debugButtonsContainer}
          >
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <MuiButton
              id="pauseButton"
              variant="contained"
              color="primary"
              size="extraSmall"
              startIcon={<FontAwesomeV6Icon iconName="pause" />}
              onClick={this.togglePause}
              style={{display: canRunNext ? 'none' : 'inline-flex'}}
              disabled={!isAttached}
              className={moduleStyles.debuggerButton}
            >
              {i18n.pause()}
            </MuiButton>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <MuiButton
              id="continueButton"
              variant="contained"
              color="primary"
              size="extraSmall"
              startIcon={<FontAwesomeV6Icon iconName="right" />}
              onClick={this.togglePause}
              style={{display: canRunNext ? 'inline-flex' : 'none'}}
              className={moduleStyles.debuggerButton}
            >
              {i18n.continue()}
            </MuiButton>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <MuiButton
              id="stepOverButton"
              variant="contained"
              color="primary"
              size="extraSmall"
              startIcon={<FontAwesomeV6Icon iconName="right-to-line" />}
              onClick={this.stepOver}
              disabled={!isPaused || !isAttached || isEditWhileRun}
              title={isEditWhileRun ? i18n.editDuringRunMessage() : undefined}
              className={moduleStyles.debuggerButton}
            >
              {i18n.stepOver()}
            </MuiButton>
            <MuiButton
              id="stepOutButton"
              variant="contained"
              color="primary"
              size="extraSmall"
              startIcon={<FontAwesomeV6Icon iconName="turn-up" />}
              onClick={this.stepOut}
              disabled={!isPaused || !isAttached || isEditWhileRun}
              title={isEditWhileRun ? i18n.editDuringRunMessage() : undefined}
              className={moduleStyles.debuggerButton}
            >
              {i18n.stepOut()}
            </MuiButton>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <MuiButton
              id="stepInButton"
              variant="contained"
              color="primary"
              size="extraSmall"
              startIcon={<FontAwesomeV6Icon iconName="turn-down" />}
              onClick={this.stepIn}
              disabled={(!isPaused && isAttached) || isEditWhileRun}
              title={isEditWhileRun ? i18n.editDuringRunMessage() : undefined}
              className={moduleStyles.debuggerButton}
            >
              {i18n.stepIn()}
            </MuiButton>
          </div>
        </div>
      );
    }
  }
);
