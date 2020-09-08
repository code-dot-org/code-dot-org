import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import InputPrompt from '@cdo/apps/templates/InputPrompt';
import i18n from '@cdo/locale';

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
  }
};

const description = `
    Don't have a file downloaded? Provide the URL to an image on the web.
    This works for URLs that end with *.GIF*, *.PNG*, or *.JPG*.
    `;

export default class ImageURLInput extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    allowedExtensions: PropTypes.string,
    currentValue: PropTypes.string
  };

  handleSubmitWrapper = url => this.props.assetChosen(url, moment());

  render() {
    return (
      <div>
        <div style={styles.supportingText}>{description}</div>
        <InputPrompt
          question={'Image URL:'}
          onInputReceived={this.handleSubmitWrapper}
          currentValue={this.props.currentValue}
        />
        <div style={styles.example}>{i18n.imageURLInputExample()}</div>
      </div>
    );
  }
}
