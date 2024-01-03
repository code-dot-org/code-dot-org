import React, {Component} from 'react';
import PropTypes from 'prop-types';
import handleLaunchImmersiveReader from '@cdo/apps/util/immersive_reader';
import {renderButtons} from '@microsoft/immersive-reader-sdk';
import cookies from 'js-cookie';
import classNames from 'classnames';

class ImmersiveReaderButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    text: PropTypes.string,
    hasRoundBorders: PropTypes.bool,
    // TODO: [Phase 2] This is a switch for legacy styles needed to revert Javalab rebranding changes.
    //  once we update Javalab to new styles we'll need to remove this prop and all of it's usage
    //  more info here: https://github.com/code-dot-org/code-dot-org/pull/50924
    isLegacyStyles: PropTypes.bool,
  };

  componentDidMount() {
    if (this.shouldRender() && !this.renderButtonsCalled) {
      // Applies inline styling to the .immersive-reader-button elements
      renderButtons({
        elements: [this.container],
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
    const {title, text, hasRoundBorders, isLegacyStyles} = this.props;
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
        className={classNames(
          'immersive-reader-button',
          isLegacyStyles && 'immersive-reader-button-legacy-styles'
        )}
        data-button-style={'icon'}
        style={{
          borderRadius: hasRoundBorders ? 4 : '4px 0 0 4px',
        }}
        data-locale={locale}
        onClick={function () {
          handleLaunchImmersiveReader(locale, title, text);
        }}
        onKeyDown={e => this.handleKeyDown(e, locale, title, text)}
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
