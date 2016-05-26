'use strict';

import React from 'react';
import { connect } from 'react-redux';

import TopInstructionsCSF from './TopInstructionsCSF';
import TopInstructionsCSP from './TopInstructionsCSP';

/**
 * Simple class allowing us to have differences between CSF and CSP top
 * instructions. Ultimately those might be combined back into one.
 */
const TopInstructions = React.createClass({
  propTypes: {
    shortInstructionsWhenCollapsed: React.PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;

    // TODO - if we dont end up being able to recombine these two classes, it might
    // be better to come up with more description names (like maybe
    //  CollapsibleTopInstructions and ShortenableTopInstructions)
    const ChildClass = props.shortInstructionsWhenCollapsed ? TopInstructionsCSF : TopInstructionsCSP;

    return <ChildClass ref="topInstructions" {...props}/>;
  }
});

export default connect(state => ({
  shortInstructionsWhenCollapsed: !!state.instructions.shortInstructions
}))(TopInstructions);
