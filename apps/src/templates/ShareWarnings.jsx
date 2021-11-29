import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import color from '../util/color';
import AgeDropdown from './AgeDropdown';
import commonMsg from '@cdo/locale';

/**
 * Dialog contents for when you visit a shared Applab page. If not signed in,
 * it will ask your age. If the app stores data, it will also alert you to
 * that.
 */
class ShareWarnings extends Component {
  static propTypes = {
    promptForAge: PropTypes.bool.isRequired,
    showStoreDataAlert: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleTooYoung: PropTypes.func.isRequired
  };

  handleOk = () => {
    if (!this.props.promptForAge) {
      this.props.handleClose();
      return;
    }

    const ageElement = ReactDOM.findDOMNode(this.refs.age);
    if (ageElement.value === '') {
      // ignore close if we haven't selected a value from dropdown
      return;
    }

    const age = parseInt(ageElement.value, 10);
    if (age >= 13) {
      this.props.handleClose();
    } else {
      this.props.handleTooYoung();
    }
  };

  render() {
    return (
      <div>
        {this.props.showStoreDataAlert && (
          <div style={styles.dataMessage}>
            {commonMsg.shareWarningsStoreDataBeforeHighlight()}
            <span style={styles.dataMessageHighlight}>
              {commonMsg.shareWarningsStoreDataHighlight()}
            </span>
            {commonMsg.shareWarningsStoreDataAfterHighlight()}
          </div>
        )}
        {this.props.promptForAge && (
          <div>
            <div style={styles.ageMessage}>{commonMsg.shareWarningsAge()}</div>
            <AgeDropdown style={styles.ageDropdown} ref="age" />
          </div>
        )}
        <div>
          <a
            style={styles.moreInfo}
            target="_blank"
            rel="noopener noreferrer"
            href="https://code.org/privacy"
          >
            {commonMsg.shareWarningsMoreInfo()}
          </a>
          <button type="button" style={styles.ok} onClick={this.handleOk}>
            {commonMsg.dialogOK()}
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  ageDropdown: {
    fontSize: 14,
    width: 220,
    height: 30,
    lineHeight: '30px',
    marginBottom: 10
  },
  dataMessage: {
    fontSize: 18,
    lineHeight: '21px',
    marginBottom: 30
  },
  dataMessageHighlight: {
    backgroundColor: 'yellow'
  },
  ageMessage: {
    fontSize: 18,
    marginBottom: 10
  },
  moreInfo: {
    marginLeft: 0,
    fontSize: 15
  },
  ok: {
    backgroundColor: color.orange,
    border: '1px solid ' + color.orange,
    color: color.white,
    float: 'right'
  }
};

export default ShareWarnings;
