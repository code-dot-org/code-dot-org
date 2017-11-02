import React, { PropTypes } from 'react';
import Alert from '@cdo/apps/templates/alert';
import i18n from '@cdo/locale';

const styles = {
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

/**
 * Component that displays a small notification at the top of the page when
 * postMilestone is disabled (and thus progress is disabled)
 */
const DisabledBubblesAlert = React.createClass({
  propTypes: {
    isHocScript: PropTypes.bool.isRequired
  },

  getInitialState() {
    // Once alert has been dismissed, don't show again.
    const disabledBubblesAlertSeen = sessionStorage.getItem('disabledBubblesAlertSeen');
    return {
      visible: !disabledBubblesAlertSeen
    };
  },

  onClose() {
    this.setState({visible: false});
    sessionStorage.setItem('disabledBubblesAlertSeen', true);
  },

  render() {
    if (!this.state.visible) {
      return null;
    }

    return (
      <Alert onClose={this.onClose} type={'error'}>
        <div>
          <span style={styles.bold}>{i18n.disabledButtonsWarning() + " "}</span>
          <span>{i18n.disabledButtonsInfo()  + " "}</span>
          <a
            target="_blank"
            href={window.dashboard.CODE_ORG_URL + '/saving-progress-hoc'}
          >
            {i18n.learnMore()}
          </a>
        </div>
      </Alert>
    );
  }
});

export default DisabledBubblesAlert;
