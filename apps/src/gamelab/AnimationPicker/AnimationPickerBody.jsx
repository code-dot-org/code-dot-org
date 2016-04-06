/** Body of the animation picker dialog */
'use strict';

var AnimationPickerListItem = require('./AnimationPickerListItem.jsx');
var AnimationPickerSearchBar = require('./AnimationPickerSearchBar.jsx');
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
      <ScrollableList style={{maxHeight: 400}}> {/* TODO: Is this maxHeight appropriate? */}
        <AnimationPickerListItem
            label="Draw your own"
            icon="pencil" />
        <AnimationPickerListItem
            label="Upload image"
            icon="upload" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
        <AnimationPickerListItem
            label="asterisk_circle (9)" />
      </ScrollableList>
    </div>;
  }
});
module.exports = Radium(AnimationPickerBody);
