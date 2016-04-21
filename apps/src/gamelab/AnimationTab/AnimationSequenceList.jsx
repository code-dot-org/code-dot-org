/** @file Vertical scrolling list of animation sequences */
'use strict';

var AnimationPicker = require('../AnimationPicker/AnimationPicker');
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
      {props.animations.map(function (animation) {
        return <AnimationSequenceListItem
            key={animation.key}
            animation={animation}
            isSelected={animation.key === props.selectedAnimation} />;
      })}
      <NewListItem
          key="new_animation"
          label="new sequence"
          onClick={props.onNewItemClick} />
    </ScrollableList>
  );
};
AnimationSequenceList.propTypes = {
  animations: React.PropTypes.array.isRequired,
  selectedAnimation: React.PropTypes.string,
  onNewItemClick: React.PropTypes.func.isRequired
};
module.exports = connect(function propsFromState(state) {
  return {
    animations: state.animations,
    selectedAnimation: state.animationTab.selectedAnimation
  };
}, function propsFromDispatch(dispatch) {
  return {
    onNewItemClick: function () {
      dispatch(AnimationPicker.actions.show(AnimationPicker.Goal.NEW_ANIMATION));
    }
  };
})(AnimationSequenceList);
