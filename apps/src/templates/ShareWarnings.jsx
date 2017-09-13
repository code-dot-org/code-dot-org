import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import color from "../util/color";
import AgeDropdown from './AgeDropdown';
import commonMsg from '@cdo/locale';

const styles = {
  dataMessage: {
    fontSize: 18,
    marginBottom: 30
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

/**
 * Dialog contents for when you visit a shred Applab page. If not signed in,
 * it will ask your age. If the app stores data, it will also alert you to
 * that.
 */
const ShareWarnings = React.createClass({
  propTypes: {
    promptForAge: PropTypes.bool.isRequired,
    showStoreDataAlert: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleTooYoung: PropTypes.func.isRequired
  },

  handleOk() {
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
  },

  render() {
    return (
      <div>
        {this.props.showStoreDataAlert &&
          <div style={styles.dataMessage}>{commonMsg.shareWarningsStoreData()}</div>
        }
        {this.props.promptForAge &&
          <div>
            <div style={styles.ageMessage}>{commonMsg.shareWarningsAge()}</div>
            <AgeDropdown style={styles.ageDropdonw} ref="age"/>
          </div>
        }
        <div>
          <a style={styles.moreInfo} target="_blank" href="https://code.org/privacy">{commonMsg.shareWarningsMoreInfo()}</a>
          <button style={styles.ok} onClick={this.handleOk}>{commonMsg.dialogOK()}</button>
        </div>
      </div>
    );
  }
});

export default ShareWarnings;
