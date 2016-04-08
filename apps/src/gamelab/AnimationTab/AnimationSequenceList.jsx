/** @file Vertical scrolling list of animation sequences */
'use strict';

var animationPickerActions = require('../AnimationPicker/actions');
var AnimationSequenceListItem = require('./AnimationSequenceListItem');
var connect = require('react-redux').connect;
var NewListItem = require('./NewListItem');
var ScrollableList = require('./ScrollableList');

var styles = {
  root: {
    flex: '1 0 0'
  }
};

/**
 * Vertical scrolling list of animation sequences associated with the
 * project.
 */
var AnimationSequenceList = function (props) {
  return (
    <ScrollableList style={styles.root} className="animation-sequence-list">
      <AnimationSequenceListItem sequenceName="sequence01" />
      <AnimationSequenceListItem sequenceName="sequence02" isSelected />
      <NewListItem label="new sequence" onClick={props.onNewItemClick} />
    </ScrollableList>
  );
};
AnimationSequenceList.propTypes = {
  onNewItemClick: React.PropTypes.func.isRequired
};
module.exports = connect(function propsFromState(state) {
  return {};
}, function propsFromDispatch(dispatch) {
  return {
    onNewItemClick: function () {
      dispatch(animationPickerActions.showAnimationPicker());
    }
  };
})(AnimationSequenceList);
