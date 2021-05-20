import React, {Component} from 'react';
import PropTypes from 'prop-types';
import handleLaunchImmersiveReader from '@cdo/apps/util/immersive_reader';
import {renderButtons} from '@microsoft/immersive-reader-sdk';
import cookies from 'js-cookie';

class ImmersiveReaderButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    text: PropTypes.string
  };

  componentDidMount() {
    if (this.shouldRender() && !this.renderButtonsCalled) {
      // Applies inline styling to the .immersive-reader-button elements
      renderButtons({
        elements: [this.container]
      });
      // Make sure renderButtons() is only called once.
      this.renderButtonsCalled = true;
    }
  }

  render() {
    const {title, text} = this.props;
    // Get the current language from the language cookie.
    const locale = cookies.get('language_') || 'en-US';

    if (!this.shouldRender()) {
      return null;
    }

    return (
      <div
        ref={el => (this.container = el)}
        className={'immersive-reader-button'}
        data-button-style={'icon'}
        data-locale={locale}
        onClick={function() {
          handleLaunchImmersiveReader(locale, title, text);
        }}
      />
    );
  }

  // Determines if this button should be rendered.
  shouldRender() {
    // If there is no text, then skip rendering it.
    return !!this.props.text;
  }
}

export default ImmersiveReaderButton;
