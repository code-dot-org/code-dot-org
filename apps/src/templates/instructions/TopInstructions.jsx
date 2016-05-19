'use strict';

import TopInstructionsCSF from './TopInstructionsCSF';
import TopInstructionsCSP from './TopInstructionsCSP';

const TopInstructions = React.createClass({
  getContentHeight() {
    return this.refs.topInstructions.getWrappedInstance().getContentHeight();
  },

  render() {
    const { props } = this;

    const ChildClass = props.csf ? TopInstructionsCSF : TopInstructionsCSP;

    return <ChildClass ref="topInstructions" {...props}/>;
  }
});

export default TopInstructions;
