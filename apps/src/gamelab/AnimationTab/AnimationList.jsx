/** @file Vertical scrolling list of animation sequences */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import color from "../../util/color";
import * as shapes from '../shapes';
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
  }
};

/**
 * Vertical scrolling list of animations associated with the project.
 */
class AnimationList extends React.Component {
  static propTypes = {
    animationList: shapes.AnimationList.isRequired,
    selectedAnimation: shapes.AnimationKey,
    onNewItemClick: PropTypes.func.isRequired
  };

  render() {
    return (
      <ScrollableList style={styles.root} className="animationList">
        {this.props.animationList.orderedKeys.map(key =>
          <AnimationListItem
            key={key}
            animationKey={key}
            animationProps={this.props.animationList.propsByKey[key]}
            isSelected={key === this.props.selectedAnimation}
            animationList={this.props.animationList}
          />
        )}
        <NewListItem
          key="new_animation"
          label="new animation"
          onClick={this.props.onNewItemClick}
        />
      </ScrollableList>
    );
  }
}
export default connect(state => ({
  animationList: state.animationList,
  selectedAnimation: state.animationTab.selectedAnimation
}), dispatch => ({
  onNewItemClick() {
    dispatch(show(Goal.NEW_ANIMATION));
  }
}))(AnimationList);
