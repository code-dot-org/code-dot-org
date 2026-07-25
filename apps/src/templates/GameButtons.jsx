import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {useRunButtonColorOverride} from '@cdo/apps/blockly/utils/setupBlockColor';
import msg from '@cdo/locale';

import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import {getRunButtonSx} from './runButtonSx';
import SkipButton from './SkipButton';

export const FinishButton = () => (
  <MuiButton
    id="finishButton"
    variant="contained"
    size="medium"
    color="primary"
  >
    {msg.finish()}
  </MuiButton>
);

export const RunButton = props => {
  // Mirrors the setup ("when run") block color under accessibility themes.
  const colorOverride = useRunButtonColorOverride();
  return (
    <MuiButton
      id={props.id || 'runButton'}
      variant="contained"
      size="medium"
      color="primary"
      className={props.hidden ? 'hide' : ''}
      sx={getRunButtonSx(colorOverride)}
      startIcon={props.icon ?? <FontAwesomeV6Icon iconName="play" />}
    >
      {props.runButtonText || msg.runProgram()}
    </MuiButton>
  );
};
RunButton.propTypes = {
  id: PropTypes.string,
  hidden: PropTypes.bool,
  style: PropTypes.object,
  runButtonText: PropTypes.string,
  icon: PropTypes.node,
};
RunButton.displayName = 'RunButton';

// The reset button is hidden by default,
// then shown either by passing in style props to override
// or imperatively by selecting the DOM node by ID
// elsewhere in our code base (eg, StudioApp)
export const ResetButton = props => (
  <MuiButton
    id={props.id || 'resetButton'}
    variant="contained"
    size="medium"
    color="primary"
    className={props.hidden ? 'hide' : ''}
    style={{display: 'none', ...props.style}}
    startIcon={props.icon ?? <FontAwesomeV6Icon iconName="rotate-right" />}
  >
    {!props.hideText && msg.resetProgram()}
  </MuiButton>
);
ResetButton.propTypes = {
  id: PropTypes.string,
  hidden: PropTypes.bool,
  style: PropTypes.object,
  hideText: PropTypes.bool,
  icon: PropTypes.node,
};
ResetButton.displayName = 'ResetButton';

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
export const UnconnectedGameButtons = props => (
  <div>
    <ProtectedStatefulDiv id="gameButtons">
      {!props.noRunResetButton && (
        <>
          <RunButton
            runButtonText={props.runButtonText}
            icon={props.runButtonIcon}
            hidden={props.hideRunButton}
          />
          <ResetButton
            hidden={props.hideResetButton}
            icon={props.resetButtonIcon}
          />
        </>
      )}
      {
        ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
      }
      {props.children}
    </ProtectedStatefulDiv>
    <div id="gameButtonExtras">
      {props.showSkipButton && <SkipButton nextLevelUrl={props.nextLevelUrl} />}
      {props.showFinishButton && <FinishButton />}
    </div>
  </div>
);
UnconnectedGameButtons.propTypes = {
  hideRunButton: PropTypes.bool,
  hideResetButton: PropTypes.bool,
  runButtonText: PropTypes.string,
  runButtonIcon: PropTypes.node,
  resetButtonIcon: PropTypes.node,
  nextLevelUrl: PropTypes.string,
  showSkipButton: PropTypes.bool,
  widgetMode: PropTypes.bool,
  showFinishButton: PropTypes.bool,
  children: PropTypes.node,
  noRunResetButton: PropTypes.bool,
};
UnconnectedGameButtons.displayName = 'GameButtons';

export default connect(state => ({
  hideRunButton: state.pageConstants.hideRunButton,
  hideResetButton: state.pageConstants.hideResetButton,
  runButtonText: state.pageConstants.runButtonText,
  nextLevelUrl: state.pageConstants.nextLevelUrl,
  showSkipButton: state.pageConstants.isChallengeLevel,
  widgetMode: state.pageConstants.widgetMode,
}))(UnconnectedGameButtons);
