import React, { PropTypes } from 'react';
import Alert from '@cdo/apps/templates/alert';
import i18n from '@cdo/locale';

// TODO - would be great if this was in one place (probably on the server)
// TODO make sure list is correct
// TODO - mobile?

function isHocScript(name) {
  return [
    "Hour of Code",
    "flappy",
    "playlab",
    "artist",
    "frozen",
    "hourofcode",
    "infinity",
    "iceage",
    "starwars",
    "gumball",
    "starwarsblocks",
    "mc"
  ].includes(name);
}

const styles = {
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

const DisabledBubblesAlert = React.createClass({
  propTypes: {
    scriptName: PropTypes.string.isRequired,
  },

  getInitialState() {
    // Once alert has been dismissed, don't show again.
    const disabledBubblesAlertSeen = localStorage.getItem('disabledBubblesAlertSeen');
    return {
      visible: !disabledBubblesAlertSeen
    };
  },

  onClose() {
    this.setState({visible: false});
    localStorage.setItem('disabledBubblesAlertSeen', true);
  },
  render() {
    if (!this.state.visible) {
      return null;
    }

    let type, intro;
    if (isHocScript(this.props.scriptName)) {
      type = 'warning';
      intro = i18n.disabeldButtonsWhy();
    } else {
      type = 'error';
      intro = i18n.disabledButtonsWarning();
    }
    return (
      <Alert onClose={this.onClose} type={type}>
        <div>
          <span style={styles.bold}>{intro + " "}</span>
          <span>{i18n.disabledButtonsInfo()  + " "}</span>
          {/* TODO - where should this link go? */}
          <a href="#">{i18n.learnMore()}</a>
        </div>
      </Alert>
    );
  }
});

export default DisabledBubblesAlert;
