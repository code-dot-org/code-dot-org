/** @file Vertical scrolling list of animation sequences */
'use strict';

var animationPickerActions = require('../AnimationPicker/actions');
var AnimationSequenceListItem = require('./AnimationSequenceListItem.jsx');
var connect = require('react-redux').connect;
var NewListItem = require('./NewListItem.jsx');
var ScrollableList = require('./ScrollableList.jsx');

/**
 * Vertical scrolling list of animation sequences associated with the
 * project.
 */
var AnimationSequenceList = React.createClass({
  propTypes: {
    onNewItemClick: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <ScrollableList className="animation-sequence-list">
        <AnimationSequenceListItem sequenceName="sequence01" />
        <AnimationSequenceListItem sequenceName="sequence02" isSelected />
        <NewListItem label="new sequence" onClick={this.props.onNewItemClick} />
      </ScrollableList>
    );
  }
});
module.exports = connect(function propsFromState(state) {
  return {};
}, function propsFromDispatch(dispatch) {
  return {
    onNewItemClick: function () {
      dispatch(animationPickerActions.showAnimationPicker());
    }
  };
})(AnimationSequenceList);
