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

// TODO - i18n

/**
 * Component that displays a small notification at the top of the page when
 * postMilestone is disabled (and thus progress is isable)
 */
const DisabledBubblesModal = React.createClass({
  getInitialState() {
    return {
      open: !sessionStorage.getItem('disableBubblesModalSeen')
    };
  },

  handleClose() {
    this.setState({open: false});
    sessionStorage.setItem('disableBubblesModalSeen', true);
  },

  render() {
    return (
      <BaseDialog
        isOpen={this.state.open}
        uncloseable={true}
      >
        <div style={styles.main}>
          <div style={styles.paragraph}>
            Any progress you make this week on your course will not be saved due
            to the level of traffic our site receives for the Hour of Code week.
          </div>
          <div style={styles.paragraph}>
            This is why all your bubbles are displayed as gray (don’t worry, your
            progress from before this week is still safe).
          </div>
          <div style={styles.paragraph}>
            We encourage you to try Hour of Code tutorials instead this week.
          </div>
          <div style={styles.paragraph}>
            <a href={window.dashboard.CODE_ORG_URL +'/saving-progress-csf'}>
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
