/**
 * Fires an event when page visibility changes.
 * Wrap a component in this to listen for page visibility.
 */
import React, {PropTypes} from 'react';

export default class VisibilitySensor extends React.Component {
  static propTypes = {
    onVisible: PropTypes.func,
    onHidden: PropTypes.func,
    children: PropTypes.element
  };

  componentDidMount() {
    // Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#Example
    // Set the name of the hidden property and the change event for visibility
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }
    if (typeof document.addEventListener !== "undefined" && typeof document[this.hidden] !== "undefined") {
      // Handle page visibility change
      document.addEventListener(this.visibilityChange, this.handleVisibilityChange, false);
    }
  }

  componentWillUnmount() {
    if (this.visibilityChange) {
      document.removeEventListener(this.visibilityChange, this.handleVisibilityChange);
    }
  }

  handleVisibilityChange = () => {
    if (document[this.hidden]) {
      if (this.props.onHidden) {
        this.props.onHidden();
      }
    } else {
      if (this.props.onVisible) {
        this.props.onVisible();
      }
    }
  };

  render() {
    if (this.props.children) {
      return React.cloneElement(this.props.children);
    } else {
      return null;
    }
  }
}

