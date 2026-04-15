import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

// Matches KeyCodes in studio.js: LEFT=37, UP=38, RIGHT=39, DOWN=40
const ARROW_KEY_CODES = {
  leftButton: 37,
  upButton: 38,
  rightButton: 39,
  downButton: 40,
};

/**
 * A set of arrow buttons
 */
class ArrowButtons extends React.Component {
  static propTypes = {
    // from redux
    visible: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
  };

  render() {
    const {visible, disabled} = this.props;
    const style = visible ? styles.visible : styles.hidden;

    const onKeyDown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const keyCode = ARROW_KEY_CODES[e.currentTarget.id];
        window.dispatchEvent(
          new KeyboardEvent('keydown', {keyCode, bubbles: true})
        );
      }
    };
    const onKeyUp = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const keyCode = ARROW_KEY_CODES[e.currentTarget.id];
        window.dispatchEvent(
          new KeyboardEvent('keyup', {keyCode, bubbles: true})
        );
      }
    };

    return (
      <div style={style} id="soft-buttons">
        <button
          type="button"
          id="leftButton"
          disabled={disabled}
          className="arrow"
          aria-label="Left arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <img
            src="/blockly/media/1x1.gif"
            className="left-btn icon21"
            alt=""
          />
        </button>
        <button
          type="button"
          id="rightButton"
          disabled={disabled}
          className="arrow"
          aria-label="Right arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <img
            src="/blockly/media/1x1.gif"
            className="right-btn icon21"
            alt=""
          />
        </button>
        <button
          type="button"
          id="upButton"
          disabled={disabled}
          className="arrow"
          aria-label="Up arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <img src="/blockly/media/1x1.gif" className="up-btn icon21" alt="" />
        </button>
        <button
          type="button"
          id="downButton"
          disabled={disabled}
          className="arrow"
          aria-label="Down arrow"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <img
            src="/blockly/media/1x1.gif"
            className="down-btn icon21"
            alt=""
          />
        </button>
      </div>
    );
  }
}

const styles = {
  hidden: {display: 'none'},
  visible: {display: 'inline-block'},
};

export default connect(state => ({
  visible: state.arrowDisplay.buttonsAreVisible,
  disabled: state.arrowDisplay.buttonsAreDisabled,
}))(ArrowButtons);
