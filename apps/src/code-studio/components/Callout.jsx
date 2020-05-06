import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

const styles = {
  closeX: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 13,
    lineHeight: 0,
    boxShadow: 'unset',
    borderWidth: 0,
    backgroundColor: 'unset',
    paddingRight: 0,
    color: color.black,
    ':hover': {
      boxShadow: 'unset',
      backgroundColor: 'unset'
    }
  }
};

// Note that additional styling can be found in apps/style/Callout.scss.

/**
 * Displays a directional message box over the screen
 */
export default class Callout extends React.Component {
  static propTypes = {
    onCalloutDismissed: PropTypes.func.isRequired,
    shouldShowCallout: PropTypes.bool.isRequired,
    style: PropTypes.object,
    children: PropTypes.node
  };

  render() {
    if (this.props.shouldShowCallout) {
      return (
        <div
          className="callout"
          onClick={this.props.onCalloutDismissed}
          style={this.props.style || {}}
        >
          {this.props.children}
          <Button
            style={styles.closeX}
            onClick={this.props.onCalloutDismissed}
            icon={'times'}
            color={Button.ButtonColor.white}
            // Elements that display over minecraft can't use <button> right now
            // unless they want minecraft styling due to the use of !important
            // in the minecraft stylesheet.
            __useDeprecatedTag
          />
        </div>
      );
    } else {
      return null;
    }
  }
}
