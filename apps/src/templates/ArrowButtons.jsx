import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

/**
 * A set of arrow buttons
 */
class ArrowButtons extends React.Component {
  static propTypes = {
    // from redux
    visible: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired
  };

  render() {
    const {visible, disabled} = this.props;
    const className = !visible && 'hidden';
    return (
      <div className={className} id="soft-buttons">
        <button
          type="button"
          id="leftButton"
          disabled={disabled}
          className="arrow"
        >
          <img src="/blockly/media/1x1.gif" className="left-btn icon21" />
        </button>
        <button
          type="button"
          id="rightButton"
          disabled={disabled}
          className="arrow"
        >
          <img src="/blockly/media/1x1.gif" className="right-btn icon21" />
        </button>
        <button
          type="button"
          id="upButton"
          disabled={disabled}
          className="arrow"
        >
          <img src="/blockly/media/1x1.gif" className="up-btn icon21" />
        </button>
        <button
          type="button"
          id="downButton"
          disabled={disabled}
          className="arrow"
        >
          <img src="/blockly/media/1x1.gif" className="down-btn icon21" />
        </button>
      </div>
    );
  }
}

export default connect(state => ({
  visible: state.arrowDisplay.buttonsAreVisible,
  disabled: state.arrowDisplay.buttonsAreDisabled
}))(ArrowButtons);
