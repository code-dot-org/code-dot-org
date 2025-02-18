/** @file Vertical scrolling list of animation sequences */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {P5LabInterfaceMode} from '../constants';
import {show, showBackground, Goal} from '../redux/animationPicker';
import * as shapes from '../shapes';

import AnimationListItem from './AnimationListItem';
import NewListItem from './NewListItem';
import ScrollableList from './ScrollableList';

/**
 * Vertical scrolling list of animations associated with the project.
 */
class AnimationList extends React.Component {
  static propTypes = {
    animationList: shapes.AnimationList.isRequired,
    currentAnimations: shapes.CurrentAnimations,
    onNewItemClick: PropTypes.func.isRequired,
    spriteLab: PropTypes.bool.isRequired,
    hideBackgrounds: PropTypes.bool.isRequired,
    hideCostumes: PropTypes.bool.isRequired,
    labType: PropTypes.string.isRequired,
  };

  render() {
    const {
      animationList,
      hideBackgrounds,
      hideCostumes,
      labType,
      onNewItemClick,
      spriteLab,
      currentAnimations,
    } = this.props;
    let newAnimationLabel;
    if (spriteLab) {
      newAnimationLabel = hideBackgrounds
        ? i18n.newCostume()
        : i18n.newBackground();
    } else {
      newAnimationLabel = i18n.newAnimation();
    }
    let addAnimation = (
      <NewListItem
        key="new_animation"
        label={newAnimationLabel}
        onClick={() => onNewItemClick(spriteLab, hideCostumes)}
      />
    );
    let animationListKeys = animationList.orderedKeys;
    if (hideBackgrounds) {
      animationListKeys = animationListKeys.filter(key => {
        return !this.backgroundCategoryAnimations(key);
      });
    } else if (hideCostumes) {
      animationListKeys = animationListKeys.filter(key => {
        return this.backgroundCategoryAnimations(key);
      });
    }
    return (
      <ScrollableList style={styles.root} className="animationList">
        {spriteLab && addAnimation}
        {animationListKeys.map(key => (
          <AnimationListItem
            key={key}
            animationKey={key}
            animationProps={animationList.propsByKey[key]}
            isSelected={
              key === currentAnimations[P5LabInterfaceMode.ANIMATION] ||
              key === currentAnimations[P5LabInterfaceMode.BACKGROUND]
            }
            animationList={animationList}
            labType={labType}
          />
        ))}
        {!spriteLab && addAnimation}
      </ScrollableList>
    );
  }

  backgroundCategoryAnimations(key) {
    return (
      this.props.animationList.propsByKey?.[key]?.categories || []
    ).includes('backgrounds');
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
    paddingLeft: 10,
  },
};
export default connect(
  state => ({
    animationList: state.animationList,
    currentAnimations: state.animationTab.currentAnimations,
    spriteLab: state.pageConstants.isBlockly,
  }),
  dispatch => ({
    onNewItemClick(isSpriteLab, hideCostumes) {
      if (hideCostumes) {
        dispatch(showBackground(Goal.NEW_ANIMATION));
      } else {
        dispatch(show(Goal.NEW_ANIMATION, isSpriteLab));
      }
    },
  })
)(AnimationList);
