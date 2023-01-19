/** @file Vertical scrolling list of animation sequences */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import * as shapes from '../shapes';
import {show, showBackground, Goal} from '../redux/animationPicker';
import AnimationListItem from './AnimationListItem';
import NewListItem from './NewListItem';
import ScrollableList from './ScrollableList';
import i18n from '@cdo/locale';

/**
 * Vertical scrolling list of animations associated with the project.
 */
class AnimationList extends React.Component {
  static propTypes = {
    animationList: shapes.AnimationList.isRequired,
    selectedAnimation: shapes.AnimationKey,
    onNewItemClick: PropTypes.func.isRequired,
    spriteLab: PropTypes.bool.isRequired,
    hideBackgrounds: PropTypes.bool.isRequired,
    hideCostumes: PropTypes.bool.isRequired,
    labType: PropTypes.string.isRequired
  };

  render() {
    let buttonLabelNewAnimation;
    if (this.props.spriteLab) {
      buttonLabelNewAnimation = this.props.hideBackgrounds
        ? i18n.newCostume()
        : i18n.newBackground();
    } else {
      buttonLabelNewAnimation = i18n.newAnimation();
    }
    let addAnimation = (
      <NewListItem
        key="new_animation"
        label={buttonLabelNewAnimation}
        onClick={() =>
          this.props.onNewItemClick(
            this.props.spriteLab,
            this.props.hideCostumes
          )
        }
      />
    );
    let animationListKeys = this.props.animationList.orderedKeys;
    if (this.props.hideBackgrounds) {
      animationListKeys = animationListKeys.filter(key => {
        return !this.backgroundCategoryAnimations(key);
      });
    } else if (this.props.hideCostumes) {
      animationListKeys = animationListKeys.filter(key => {
        return this.backgroundCategoryAnimations(key);
      });
    }
    return (
      <ScrollableList style={styles.root} className="animationList">
        {this.props.spriteLab && addAnimation}
        {animationListKeys.map(key => (
          <AnimationListItem
            key={key}
            animationKey={key}
            animationProps={this.props.animationList.propsByKey[key]}
            isSelected={key === this.props.selectedAnimation}
            animationList={this.props.animationList}
            labType={this.props.labType}
          />
        ))}
        {!this.props.spriteLab && addAnimation}
      </ScrollableList>
    );
  }

  backgroundCategoryAnimations(key) {
    return (this.props.animationList.propsByKey[key].categories || []).includes(
      'backgrounds'
    );
  }
}

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
export default connect(
  state => ({
    animationList: state.animationList,
    selectedAnimation: state.animationTab.selectedAnimation,
    spriteLab: state.pageConstants.isBlockly
  }),
  dispatch => ({
    onNewItemClick(isSpriteLab, hideCostumes) {
      if (hideCostumes) {
        dispatch(showBackground(Goal.NEW_ANIMATION));
      } else {
        dispatch(show(Goal.NEW_ANIMATION, isSpriteLab));
      }
    }
  })
)(AnimationList);
