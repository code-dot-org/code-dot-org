'use strict';

// Note: This file is not linted, because it uses the JSX spread operator, and
// our linter can't support that without enabling ES6 linting everywhere (which
// we don't yet want)

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
    renderContents: React.PropTypes.func
  },

  shouldComponentUpdate: function () {
    return false;
  },

  componentDidMount: function () {
    if (typeof this.props.renderContents === 'function') {
      this.refs.root.innerHTML = this.props.renderContents();
    }
  },

  componentWillUnmount: function () {
    throw new Error("Unmounting a ProtectedStatefulDiv is not allowed.");
  },

  render: function () {
    return <div {...this.props} ref="root"></div>;
  }
});
module.exports = ProtectedStatefulDiv;
