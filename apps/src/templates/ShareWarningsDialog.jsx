import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../util/color';
import ShareWarnings from './ShareWarnings';

/**
 * Modal for our SharingWarnings.
 */
class ShareWarningsDialog extends Component {
  static propTypes = {
    promptForAge: PropTypes.bool.isRequired,
    showStoreDataAlert: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleTooYoung: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: this.props.promptForAge || this.props.showStoreDataAlert
    };
  }

  componentDidMount() {
    // We didn't need to show our modal. Go through the close process so that
    // app becomes unblocked
    if (!this.state.modalIsOpen) {
      this.handleClose();
    }
  }

  handleTooYoung = () => {
    this.setState({modalIsOpen: false});
    this.props.handleTooYoung();
  };

  handleClose = () => {
    this.setState({modalIsOpen: false});
    this.props.handleClose();
  };

  render() {
    if (!this.state.modalIsOpen) {
      return <div />;
    }

    const mainStyle = {
      ...styles.main,
      width: window.screen.width < 500 ? '80%' : undefined
    };

    return (
      <div>
        <div style={styles.overlay} />
        <div style={mainStyle}>
          <ShareWarnings
            promptForAge={this.props.promptForAge}
            showStoreDataAlert={this.props.showStoreDataAlert}
            handleTooYoung={this.handleTooYoung}
            handleClose={this.handleClose}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: 'translate(-50%, 0)',
    WebkitTransform: 'translate(-50%, 0)',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
    zIndex: 1050 // based off of behavior in dashboard's dialog.js
    // width handle in render
  },
  overlay: {
    position: 'fixed',
    opacity: 0.8,
    backgroundColor: color.black,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1040 // based off of behavior in dashboard's dialog.js
  }
};

export default ShareWarningsDialog;
