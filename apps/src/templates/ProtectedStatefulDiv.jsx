import _ from 'lodash';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';

/**
 * A div DOM element that will never update its contents unless canUpdate
 * is assigned true. It will throw an exception if it is ever unmounted,
 * enforcing that it must always be rendered because its contents may
 * contain state that the application is depending on.
 *
 * Useful when React is wrapping external libraries or parts of our UI that are
 * not yet driven by React.
 */
class ProtectedStatefulDiv extends React.Component {
  static propTypes = {
    contentFunction: PropTypes.func,
    children: PropTypes.node,
    canUpdate: PropTypes.bool,
  };

  static defaultProps = {
    canUpdate: false,
  };

  shouldComponentUpdate() {
    return this.props.canUpdate;
  }

  componentDidMount() {
    if (typeof this.props.contentFunction === 'function') {
      this.refs.root.innerHTML = this.props.contentFunction();
    }
  }

  getRoot() {
    return this.refs.root;
  }

  componentWillUnmount() {
    // when using the storybook styleguide, we don't really need to protect
    // anything, and actually we want to unmount/remount stuff all the time
    // when the page is hot-reloaded
    if (!IN_STORYBOOK) {
      throw new Error('Unmounting a ProtectedStatefulDiv is not allowed.');
    }
  }

  render() {
    return (
      <div
        {..._.omit(this.props, [
          'contentFunction',
          'radiumConfigContext',
          'styleKeeperContext',
          'canUpdate',
        ])}
        ref="root"
      />
    );
  }
}

export default Radium(ProtectedStatefulDiv);
