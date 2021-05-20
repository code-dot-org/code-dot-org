import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import InputPrompt from '@cdo/apps/templates/InputPrompt';
import i18n from '@cdo/locale';
import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';

export default class ImageURLInput extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    allowedExtensions: PropTypes.string,
    currentValue: PropTypes.string
  };
  state = {showError: false};

  handleSubmitWrapper = url => {
    if (ABSOLUTE_REGEXP.test(url)) {
      this.props.assetChosen(url, moment());
    } else {
      this.setState({showError: true});
    }
  };

  render() {
    return (
      <div>
        <div style={styles.supportingText}>
          {i18n.imageURLInputDescription()}
        </div>
        <InputPrompt
          question={i18n.imageURLInputPrompt()}
          onInputReceived={this.handleSubmitWrapper}
          currentValue={this.props.currentValue}
        />
        {this.state.showError && (
          <div style={styles.error}>{i18n.imageURLInputInvalid()}</div>
        )}
        <div style={styles.example}>{i18n.imageURLInputExample()}</div>
      </div>
    );
  }
}

const styles = {
  supportingText: {
    margin: '1em 0',
    fontSize: '16px',
    lineHeight: '20px'
  },
  example: {
    margin: '1em 0',
    fontSize: '16px',
    lineHeight: '20px'
  },
  error: {
    color: 'red'
  }
};
