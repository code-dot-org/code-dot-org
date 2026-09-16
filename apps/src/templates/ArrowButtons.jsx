import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {KeyCodes} from '@cdo/apps/constants';

const ARROW_KEY_CODES = {
  leftButton: KeyCodes.LEFT,
  upButton: KeyCodes.UP,
  rightButton: KeyCodes.RIGHT,
  downButton: KeyCodes.DOWN,
};

/**
 * A set of arrow buttons
 */
class ArrowButtons extends React.Component {
  static propTypes = {
    // from redux
    visible: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    upIcon: PropTypes.node,
    downIcon: PropTypes.node,
  };

  render() {
    const {visible, disabled, leftIcon, rightIcon, upIcon, downIcon} =
      this.props;
    const style = visible ? styles.visible : styles.hidden;

    const onKeyDown = e => {
      if (e.keyCode === KeyCodes.ENTER || e.keyCode === KeyCodes.SPACE) {
        e.preventDefault();
        const keyCode = ARROW_KEY_CODES[e.currentTarget.id];
        window.dispatchEvent(
          new KeyboardEvent('keydown', {keyCode, bubbles: true})
        );
      }
    };
    const onKeyUp = e => {
      if (e.keyCode === KeyCodes.ENTER || e.keyCode === KeyCodes.SPACE) {
        e.preventDefault();
        const keyCode = ARROW_KEY_CODES[e.currentTarget.id];
        window.dispatchEvent(
          new KeyboardEvent('keyup', {keyCode, bubbles: true})
        );
      }
    };

    return (
      <div style={style} id="soft-buttons">
        <MuiIconButton
          id="leftButton"
          variant="outlined"
          color="secondary"
          size="medium"
          disabled={disabled}
          className="arrow"
          aria-label="Left arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          {leftIcon ?? <FontAwesomeV6Icon iconName="caret-left" />}
        </MuiIconButton>
        <MuiIconButton
          id="rightButton"
          variant="outlined"
          color="secondary"
          size="medium"
          disabled={disabled}
          className="arrow"
          aria-label="Left arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          {rightIcon ?? <FontAwesomeV6Icon iconName="caret-right" />}
        </MuiIconButton>
        <MuiIconButton
          id="upButton"
          variant="outlined"
          color="secondary"
          size="medium"
          disabled={disabled}
          className="arrow"
          aria-label="Left arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          {upIcon ?? <FontAwesomeV6Icon iconName="caret-up" />}
        </MuiIconButton>
        <MuiIconButton
          id="downButton"
          variant="outlined"
          color="secondary"
          size="medium"
          disabled={disabled}
          className="arrow"
          aria-label="Left arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          {downIcon ?? <FontAwesomeV6Icon iconName="caret-down" />}
        </MuiIconButton>
      </div>
    );
  }
}

const styles = {
  hidden: {display: 'none'},
  visible: {display: 'flex', gap: '.5rem'},
};

export default connect(state => ({
  visible: state.arrowDisplay.buttonsAreVisible,
  disabled: state.arrowDisplay.buttonsAreDisabled,
}))(ArrowButtons);
