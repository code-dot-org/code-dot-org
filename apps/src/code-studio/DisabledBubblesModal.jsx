import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';

const styles = {
  main: {
    fontSize: 16,
    margin: 15
  },
  paragraph: {
    paddingTop: 5,
    paddingBottom: 5
  },
  button: {
    textAlign: 'right'
  }
};

/**
 * Component that displays a small notification at the top of the page when
 * postMilestone is disabled (and thus progress is isable)
 */
const DisabledBubblesModal = React.createClass({
  getInitialState() {
    return {
      open: true
    };
  },

  handleClose() {
    this.setState({open: false});
  },

  render() {
    return (
      <BaseDialog
        isOpen={this.state.open}
        uncloseable={true}
      >
        <div style={styles.main}>
          <div style={styles.paragraph}>
            {i18n.disabledProgress1()}
          </div>
          <div style={styles.paragraph}>
            {i18n.disabledProgress2()}
          </div>
          <div style={styles.paragraph}>
            {i18n.disabledProgress3()}
          </div>
          <div style={styles.paragraph}>
            <a target="_blank" href={window.dashboard.CODE_ORG_URL +'/saving-progress-csf'}>
              {i18n.learnMore()}
            </a>
          </div>
          <div style={styles.button}>
            <button onClick={this.handleClose}>
              {i18n.dialogOK()}
            </button>
          </div>
        </div>
      </BaseDialog>
    );
  }
});

export default DisabledBubblesModal;
