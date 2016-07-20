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
    noInstructionsWhenCollapsed: React.PropTypes.bool.isRequired,
    hasContainedLevels: React.PropTypes.bool,
    shortInstructions: React.PropTypes.string,
    longInstructions: React.PropTypes.string,
  },

  render() {
    const { noInstructionsWhenCollapsed, shortInstructions, longInstructions, hasContainedLevels } = this.props;

    // TODO - if we dont end up being able to recombine these two classes, it might
    // be better to come up with more description names (like maybe
    //  CollapsibleTopInstructions and ShortenableTopInstructions)
    if (!shortInstructions && !longInstructions && !hasContainedLevels) {
      return <div/>;
    }

    return noInstructionsWhenCollapsed ? <TopInstructionsCSP/> : <TopInstructionsCSF/>;
  }
});

export default connect(state => ({
  noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
  hasContainedLevels: state.instructions.hasContainedLevels,
  shortInstructions: state.instructions.shortInstructions,
  longInstructions: state.instructions.longInstructions,
}))(TopInstructions);
