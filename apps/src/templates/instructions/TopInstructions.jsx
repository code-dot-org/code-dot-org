import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import TopInstructionsCSP from './TopInstructionsCSP';

/**
 * Simple class allowing us to have differences between CSF and CSP top
 * instructions. Ultimately those might be combined back into one.
 */
class TopInstructions extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool.isRequired,
    hasContainedLevels: PropTypes.bool,
    shortInstructions: PropTypes.string,
    longInstructions: PropTypes.string
  };

  render() {
    const {
      hidden,
      shortInstructions,
      longInstructions,
      hasContainedLevels
    } = this.props;

    // TODO - if we dont end up being able to recombine these two classes, it might
    // be better to come up with more description names (like maybe
    //  CollapsibleTopInstructions and ShortenableTopInstructions)
    if (
      hidden ||
      (!shortInstructions && !longInstructions && !hasContainedLevels)
    ) {
      return <div />;
    }

    return <TopInstructionsCSP />;
  }
}

export const UnconnectedTopInstructions = TopInstructions;
export default connect(state => ({
  hidden: state.pageConstants.isShareView,
  hasContainedLevels: state.instructions.hasContainedLevels,
  shortInstructions: state.instructions.shortInstructions,
  longInstructions: state.instructions.longInstructions
}))(TopInstructions);
