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
      <AnimationFrameTile index={5}/>
      <AnimationFrameTile index={6}/>
      <AnimationFrameTile index={7}/>
      <AnimationFrameTile index={8}/>
      <AnimationFrameTile index={9}/>
      <AnimationFrameTile index={10}/>
      <AnimationFrameTile index={11}/>
      <AnimationFrameTile index={12}/>
      <AnimationFrameTile index={13}/>
      <AnimationFrameTile index={14}/>
      <AnimationFrameTile index={150}/>
    </ScrollableList>;
  }
});
module.exports = AnimationFrameList;
