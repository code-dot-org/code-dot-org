'use strict';

import TopInstructionsCSF from './TopInstructionsCSF';
import TopInstructionsCSP from './TopInstructionsCSP';

/**
 * Simple class allowing us to have differences between CSF and CSP top
 * instructions. Ultimately those might be combined back into one.
 */
const TopInstructions = React.createClass({
  propTypes: {
    isCsf: React.PropTypes.bool.isRequired
  },
  getRenderedHeight() {
    return this.refs.topInstructions.getWrappedInstance().getRenderedHeight();
  },

  getCollapsedHeight() {
    return this.refs.topInstructions.getWrappedInstance().getCollapsedHeight();
  },

  render() {
    const { props } = this;

    const ChildClass = props.isCsf ? TopInstructionsCSF : TopInstructionsCSP;

    return <ChildClass ref="topInstructions" {...props}/>;
  }
});

export default TopInstructions;
