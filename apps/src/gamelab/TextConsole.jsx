/** @file Grid over visualization */
import PropTypes from 'prop-types';
import React from 'react';

export const styles = {
  hide: {
    display: 'none'
  }
};

export default class TextConsole extends React.Component {
  static propTypes = {
    consoleMessages: PropTypes.array.isRequired
  };

  componentDidUpdate(previousProp) {
    if (
      this.props.consoleMessages.length !== previousProp.consoleMessages.length
    ) {
      for (
        var i = previousProp.consoleMessages.length;
        i < this.props.consoleMessages.length;
        i++
      ) {
        var message = '';
        if (this.props.consoleMessages[i].name) {
          message = this.props.consoleMessages[i].name + ': ';
        }

        message = message + this.props.consoleMessages[i].text;
        console.log(message);
      }
    }
  }

  render() {
    return <div style={styles.hide} />;
  }
}
