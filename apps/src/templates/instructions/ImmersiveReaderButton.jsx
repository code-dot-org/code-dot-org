import React, {Component} from 'react';
import PropTypes from 'prop-types';
import handleLaunchImmersiveReader from '@cdo/apps/util/immersive_reader';
import {renderButtons} from '@microsoft/immersive-reader-sdk';
import cookies from 'js-cookie';
import experiments from '@cdo/apps/util/experiments';

class ImmersiveReaderButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    text: PropTypes.string
  };

  componentDidMount() {
    // Applies inline styling to the .immersive-reader-button elements
    renderButtons();
  }

  render() {
    const {title, text} = this.props;
    // Get the current language from the language cookie.
    const locale = cookies.get('language_') || 'en-US';

    // Hide the button if the experiment is not enabled.
    const enabled = experiments.isEnabled(experiments.IMMERSIVE_READER);
    return (
      <div
        style={enabled ? {} : {display: 'none'}}
        className={'immersive-reader-button'}
        data-button-style={'icon'}
        data-locale={locale}
        onClick={function() {
          handleLaunchImmersiveReader(locale, title, text);
        }}
      />
    );
  }
}

export default ImmersiveReaderButton;
