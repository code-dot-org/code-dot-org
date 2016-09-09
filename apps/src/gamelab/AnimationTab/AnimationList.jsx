/** @file Vertical scrolling list of animation sequences */
import React from 'react';
import { connect } from 'react-redux';
import color from '../../color';
import * as PropTypes from '../PropTypes';
import { show, Goal } from '../AnimationPicker/animationPickerModule';
import AnimationListItem from './AnimationListItem';
import NewListItem from './NewListItem';
import ScrollableList from './ScrollableList';

const styles = {
  root: {
    flex: '1 0 0',
    borderTop: 'solid thin ' + color.light_gray,
    borderBottom: 'solid thin ' + color.light_gray,
    borderLeft: 'solid thin ' + color.light_gray,
    borderRight: 'none',
    backgroundColor: color.lightest_gray,
    paddingRight: 10,
    paddingLeft: 10
  },

  previewRate: {
    color: color.purple,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3
  }
};

/**
 * Vertical scrolling list of animations associated with the project.
 */
const AnimationList = React.createClass({
  propTypes: {
    animationList: PropTypes.AnimationList.isRequired,
    selectedAnimation: PropTypes.AnimationKey,
    onNewItemClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
        <ScrollableList style={styles.root} className="animationList">
          <div style={styles.previewRate}>Preview at 30fps</div>
          {this.props.animationList.orderedKeys.map(key =>
            <AnimationListItem
              key={key}
              animationKey={key}
              animationProps={this.props.animationList.propsByKey[key]}
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
