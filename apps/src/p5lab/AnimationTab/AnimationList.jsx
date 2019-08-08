/** @file Vertical scrolling list of animation sequences */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import * as shapes from '../shapes';
import {show, Goal} from '../AnimationPicker/animationPickerModule';
import AnimationListItem from './AnimationListItem';
import NewListItem from './NewListItem';
import ScrollableList from './ScrollableList';
import i18n from '@cdo/locale';

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
    onNewItemClick: PropTypes.func.isRequired,
    spriteLab: PropTypes.bool.isRequired
  };

  render() {
    let addAnimation = (
      <NewListItem
        key="new_animation"
        label={this.props.spriteLab ? i18n.newCostume() : i18n.newAnimation()}
        onClick={this.props.onNewItemClick}
      />
    );
    return (
      <ScrollableList style={styles.root} className="animationList">
        {this.props.spriteLab && addAnimation}
        {this.props.animationList.orderedKeys.map(key => (
          <AnimationListItem
            key={key}
            animationKey={key}
            animationProps={this.props.animationList.propsByKey[key]}
            isSelected={key === this.props.selectedAnimation}
            animationList={this.props.animationList}
          />
        ))}
        {!this.props.spriteLab && addAnimation}
      </ScrollableList>
    );
  }
}
export default connect(
  state => ({
    animationList: state.animationList,
    selectedAnimation: state.animationTab.selectedAnimation,
    spriteLab: state.pageConstants.isBlockly
  }),
  dispatch => ({
    onNewItemClick() {
      dispatch(show(Goal.NEW_ANIMATION));
    }
  })
)(AnimationList);
