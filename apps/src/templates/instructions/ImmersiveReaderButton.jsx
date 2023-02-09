import React, {Component} from 'react';
import PropTypes from 'prop-types';
import handleLaunchImmersiveReader from '@cdo/apps/util/immersive_reader';
import {renderButtons} from '@microsoft/immersive-reader-sdk';
import cookies from 'js-cookie';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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

  handleKeyDown(event, locale, title, text) {
    // should trigger button press on enter or space pressed
    if (event.key === 'Enter' || event.key === ' ') {
      handleLaunchImmersiveReader(locale, title, text);
      event.preventDefault();
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
        tabIndex={0}
        role="button"
        ref={el => (this.container = el)}
        className={'immersive-reader-button'}
        data-button-style={'icon'}
        data-locale={locale}
        onClick={function() {
          handleLaunchImmersiveReader(locale, title, text);
        }}
        onKeyDown={e => this.handleKeyDown(e, locale, title, text)}
      >
        <FontAwesome icon={'assistive-listening-systems'} />
      </div>
    );
  }

  // Determines if this button should be rendered.
  shouldRender() {
    // If there is no text, then skip rendering it.
    return !!this.props.text;
  }
}

export default ImmersiveReaderButton;
