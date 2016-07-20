import { ApplabInterfaceMode } from './constants';
import React from 'react';
import { connect } from 'react-redux';

const ProtectedDesignWorkspace = React.createClass({
  propTypes: {
    interfaceMode: React.PropTypes.oneOf([
      ApplabInterfaceMode.CODE,
      ApplabInterfaceMode.DESIGN,
      ApplabInterfaceMode.DATA
    ]).isRequired
  },

  shouldComponentUpdate: function (nextProps) {
    // This component is currently semi-protected. We don't want to completely
    // disallow rerendering, since that would prevent us from being able to
    // update styles. However, we do want to prevent property changes that would
    // change the DOM structure.
    Object.keys(nextProps).forEach(function (key) {
      // interfaceMode only affects style, and can be updated
      if (key === 'interfaceMode') {
        return;
      }

      if (nextProps[key] !== this.props[key]) {
        throw new Error('Attempting to change key ' + key + ' in ProtectedDesignWorkspace');
      }
    }.bind(this));

    return true;
  },

  componentWillUnmount: function () {
    throw new Error("Unmounting ProtectedDesignWorkspace is not allowed.");
  },

  render() {
    const visible = (ApplabInterfaceMode.DESIGN === this.props.interfaceMode);
    return <div id="designWorkspace" style={{display: visible ? 'block' : 'none'}}/>;
  }
});
export default connect(state => ({
  interfaceMode: state.interfaceMode
}))(ProtectedDesignWorkspace);
