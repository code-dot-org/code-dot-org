'use strict';

var AnimationFrameTile = require('./AnimationFrameTile.jsx');
var ScrollableList = require('./ScrollableList.jsx');

var AnimationFrameList = React.createClass({
  render: function () {
    return <ScrollableList className="animation-frame-list">
      <AnimationFrameTile index={1}/>
      <AnimationFrameTile index={2}/>
      <AnimationFrameTile index={3} isSelected={true}/>
      <AnimationFrameTile index={4}/>
      <AnimationFrameTile index={151}/>
    </ScrollableList>;
  }
});
module.exports = AnimationFrameList;
