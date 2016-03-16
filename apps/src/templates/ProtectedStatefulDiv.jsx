'use strict';

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
    contentFunction: React.PropTypes.func
  },

  shouldComponentUpdate: function () {
    return false;
  },

  componentDidMount: function () {
    if (typeof this.props.contentFunction === 'function') {
      this.refs.root.innerHTML = this.props.contentFunction();
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
