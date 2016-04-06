/** Body of the animation picker dialog */
'use strict';

var AnimationPickerSearchBar = require('./AnimationPickerSearchBar.jsx');
var AnimationSequenceListItem = require('../AnimationTab/AnimationSequenceListItem.jsx');
var color = require('../../color');
var Radium = require('radium');
var ScrollableList = require('../AnimationTab/ScrollableList.jsx');

var styles = {
  title: {
    color: color.purple,
    textAlign: 'center',
    margin: 0,
    fontSize: '140%',
    lineHeight: '140%'
  }
};

var AnimationPickerBody = React.createClass({
  render: function () {
    return <div>
      <h1 style={styles.title}>Animation library</h1>
      <AnimationPickerSearchBar />
      <ScrollableList style={{maxHeight: 400}}>
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
        <AnimationSequenceListItem sequenceName="animation1" style={{width:'20%', float:'left'}} />
      </ScrollableList>
    </div>;
  }
});
module.exports = Radium(AnimationPickerBody);
