/** @file Vertical scrolling list of animation sequences */
'use strict';

import React from 'react';
import { connect } from 'react-redux';
import color from '../../color';
import { METADATA_SHAPE } from '../animationMetadata';
import { show, Goal } from '../AnimationPicker/animationPickerModule';
import AnimationListItem from './AnimationListItem';
import NewListItem from './NewListItem';
import ScrollableList from './ScrollableList';

const styles = {
  root: {
    flex: '1 0 0',
    borderTop: 'solid thin ' + color.light_purple,
    borderBottom: 'solid thin ' + color.light_purple,
    borderLeft: 'solid thin ' + color.light_purple,
    borderRight: 'none',
    backgroundColor: color.white
  }
};

/**
 * Vertical scrolling list of animations associated with the project.
 */
const AnimationList = React.createClass({
  propTypes: {
    animations: React.PropTypes.arrayOf(React.PropTypes.shape(METADATA_SHAPE)).isRequired,
    selectedAnimation: React.PropTypes.string,
    onNewItemClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
        <ScrollableList style={styles.root} className="animationList">
          {this.props.animations.map(animation =>
            <AnimationListItem
                key={animation.key}
                animation={animation}
                isSelected={animation.key === this.props.selectedAnimation}
            />
          )}
          <NewListItem
              key="new_animation"
              label="new sequence"
              onClick={this.props.onNewItemClick}
          />
        </ScrollableList>
    );
  }
});
export default connect(state => ({
  animations: state.animations,
  selectedAnimation: state.animationTab.selectedAnimation
}), dispatch => ({
  onNewItemClick() {
    dispatch(show(Goal.NEW_ANIMATION));
  }
}))(AnimationList);
