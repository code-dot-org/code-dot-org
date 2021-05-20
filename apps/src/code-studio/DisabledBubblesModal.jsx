import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';

/**
 * Component that displays a small notification at the top of the page when
 * postMilestone is disabled (and thus progress is isable)
 */
export default class DisabledBubblesModal extends React.Component {
  state = {
    open: true
  };

  handleClose = () => this.setState({open: false});

  render() {
    return (
      <BaseDialog isOpen={this.state.open} uncloseable={true}>
        <div style={styles.main}>
          <div style={styles.paragraph}>{i18n.disabledProgress1()}</div>
          <div style={styles.paragraph}>{i18n.disabledProgress2()}</div>
          <div style={styles.paragraph}>{i18n.disabledProgress3()}</div>
          <div style={styles.paragraph}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://support.code.org/hc/en-us/articles/115002660852"
            >
              {i18n.learnMore()}
            </a>
          </div>
          <div style={styles.button}>
            <button type="button" onClick={this.handleClose}>
              {i18n.dialogOK()}
            </button>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

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
