
import _ from 'lodash';
import React, {PropTypes} from 'react';
import Radium from 'radium';

/**
 * A div DOM element that will never update its contents and will throw an
 * exception if it is ever unmounted, enforcing that it must always be rendered
 * because its contents may contain state that the application is depending on.
 *
 * Useful when React is wrapping external libraries or parts of our UI that are
 * not yet driven by React.
 */
var ProtectedStatefulDiv = React.createClass({
  propTypes: {
    contentFunction: PropTypes.func,
    children: PropTypes.node,
  },

  shouldComponentUpdate: function () {
    return false;
  },

  componentDidMount: function () {
    if (typeof this.props.contentFunction === 'function') {
      this.refs.root.innerHTML = this.props.contentFunction();
    }
  },

  getRoot() {
    return this.refs.root;
  },

  componentWillUnmount: function () {
    // when using the storybook styleguide, we don't really need to protect
    // anything, and actually we want to unmount/remount stuff all the time
    // when the page is hot-reloaded
    if (!IN_STORYBOOK) {
      throw new Error("Unmounting a ProtectedStatefulDiv is not allowed.");
    }
  },

  render: function () {
    return <div {..._.omit(this.props, ['contentFunction'])} ref="root"/>;
  }
});

export default Radium(ProtectedStatefulDiv);
