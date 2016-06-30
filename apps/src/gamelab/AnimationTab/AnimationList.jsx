/** @file Vertical scrolling list of animation sequences */
'use strict';

import React from 'react';
import { connect } from 'react-redux';
import color from '../../color';
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
    animationList: React.PropTypes.object.isRequired, // TODO: Shape?
    selectedAnimation: React.PropTypes.string,
    onNewItemClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
        <ScrollableList style={styles.root} className="animationList">
          {this.props.animationList.orderedKeys.map(key =>
            <AnimationListItem
                key={key}
                animationKey={key}
                animationData={this.props.animationList.propsByKey[key]}
                isSelected={key === this.props.selectedAnimation}
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
  animationList: state.animationList,
  selectedAnimation: state.animationTab.selectedAnimation
}), dispatch => ({
  onNewItemClick() {
    dispatch(show(Goal.NEW_ANIMATION));
  }
}))(AnimationList);
