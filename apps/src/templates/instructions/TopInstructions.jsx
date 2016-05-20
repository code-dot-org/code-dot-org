'use strict';

import TopInstructionsCSF from './TopInstructionsCSF';
import TopInstructionsCSP from './TopInstructionsCSP';

const TopInstructions = React.createClass({
  getRenderedHeight() {
    return this.refs.topInstructions.getWrappedInstance().getRenderedHeight();
  },

  render() {
    const { props } = this;

    const ChildClass = props.csf ? TopInstructionsCSF : TopInstructionsCSP;

    return <ChildClass ref="topInstructions" {...props}/>;
  }
});

export default TopInstructions;
