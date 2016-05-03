/** @file Vertical scrolling list of animation sequences */
'use strict';

var animationPickerModule = require('../AnimationPicker/animationPickerModule');
var AnimationListItem = require('./AnimationListItem');
var color = require('../../color');
var connect = require('react-redux').connect;
var NewListItem = require('./NewListItem');
var ScrollableList = require('./ScrollableList');

var styles = {
  root: {
    flex: '1 0 0',
    border: 'solid thin ' + color.light_purple,
    borderRight: 'none',
    backgroundColor: color.white
  }
};

/**
 * Vertical scrolling list of animations associated with the project.
 */
var AnimationList = function (props) {
  return (
    <ScrollableList style={styles.root} className="animationList">
      {props.animations.map(function (animation) {
        return <AnimationListItem
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
AnimationList.propTypes = {
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
      dispatch(animationPickerModule.show(animationPickerModule.Goal.NEW_ANIMATION));
    }
  };
})(AnimationList);
