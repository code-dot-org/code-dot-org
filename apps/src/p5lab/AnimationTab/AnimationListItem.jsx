/** A single list item representing an animation. */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import color from '@cdo/apps/util/color';

import {P5LabInterfaceMode} from '../constants';
import {
  setAnimationName,
  cloneAnimation,
  deleteAnimation,
  setAnimationFrameDelay,
  setAnimationLooping,
  isNameUnique,
} from '../redux/animationList';
import {selectAnimation, selectBackground} from '../redux/animationTab';
import * as shapes from '../shapes';

import ListItemButtons from './ListItemButtons';
import ListItemThumbnail from './ListItemThumbnail';

/**
 * A single list item representing an animation.  Displays an animated
 * thumbnail, along with the animation name and (if currently selected)
 * controls for deleting or duplicating the animation.
 */
class AnimationListItem extends React.Component {
  static propTypes = {
    isSelected: PropTypes.bool,
    animationKey: shapes.AnimationKey.isRequired,
    animationList: shapes.AnimationList.isRequired,
    columnWidth: PropTypes.number.isRequired,
    cloneAnimation: PropTypes.func.isRequired,
    interfaceMode: PropTypes.oneOf(Object.values(P5LabInterfaceMode))
      .isRequired,
    deleteAnimation: PropTypes.func.isRequired,
    selectAnimation: PropTypes.func.isRequired,
    selectBackground: PropTypes.func.isRequired,
    setAnimationName: PropTypes.func.isRequired,
    setAnimationLooping: PropTypes.func.isRequired,
    setAnimationFrameDelay: PropTypes.func.isRequired,
    children: PropTypes.node,
    style: PropTypes.object,
    allAnimationsSingleFrame: PropTypes.bool.isRequired,
    isSpriteLab: PropTypes.bool.isRequired,
    labType: PropTypes.string.isRequired,
  };

  getAnimationProps(props) {
    const {animationList, animationKey} = props;
    return animationList.propsByKey[animationKey];
  }

  constructor(props) {
    super(props);
    const {name, frameDelay} = this.getAnimationProps(props);
    this.state = {
      frameDelay: frameDelay,
      name: name,
      isNameValid: true,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.columnWidth !== nextProps.columnWidth) {
      this.refs.thumbnail.forceResize();
    }
    this.setState({frameDelay: this.getAnimationProps(nextProps).frameDelay});
    if (this.props.isSelected && !nextProps.isSelected) {
      this.setState({
        name: this.getAnimationProps(this.props).name,
        isNameValid: true,
      });
    }
  }

  UNSAFE_componentWillMount() {
    this.setState({frameDelay: this.getAnimationProps(this.props).frameDelay});
    this.debouncedFrameDelay = _.debounce(() => {
      const latestFrameDelay = this.state.frameDelay;
      this.props.setAnimationFrameDelay(
        this.props.animationKey,
        latestFrameDelay
      );
    }, 200);
  }

  onSelect = () => {
    if (this.props.interfaceMode === P5LabInterfaceMode.BACKGROUND) {
      this.props.selectBackground(this.props.animationKey);
    } else {
      this.props.selectAnimation(this.props.animationKey);
    }
  };

  cloneAnimation = evt => {
    this.props.cloneAnimation(
      this.props.animationKey,
      this.props.interfaceMode
    );
    evt.stopPropagation();
  };

  deleteAnimation = () => {
    this.props.deleteAnimation(
      this.props.animationKey,
      this.props.isSpriteLab,
      this.props.interfaceMode
    );
  };

  setAnimationLooping = looping => {
    this.props.setAnimationLooping(this.props.animationKey, looping);
  };

  onNameChange = event => {
    const {animationKey, animationList, setAnimationName} = this.props;
    const newName = event.target.value;
    const isNameValid = isNameUnique(newName, animationList.propsByKey);
    this.setState({name: newName, isNameValid: isNameValid});
    if (isNameValid) {
      setAnimationName(animationKey, newName);
    }
  };

  convertFrameDelayToLockedValues(fraction) {
    if (fraction >= 60) {
      return 0;
    } else if (fraction >= 45) {
      return 0.1;
    } else if (fraction >= 30) {
      return 0.2;
    } else if (fraction >= 20) {
      return 0.3;
    } else if (fraction >= 15) {
      return 0.4;
    } else if (fraction >= 10) {
      return 0.5;
    } else if (fraction >= 5) {
      return 0.6;
    } else if (fraction >= 4) {
      return 0.7;
    } else if (fraction >= 3) {
      return 0.8;
    } else if (fraction >= 2) {
      return 0.9;
    } else {
      return 1;
    }
  }

  convertLockedValueToFrameDelay(value) {
    if (value >= 1) {
      return 1;
    } else if (value >= 0.9) {
      return 2;
    } else if (value >= 0.8) {
      return 3;
    } else if (value >= 0.7) {
      return 4;
    } else if (value >= 0.6) {
      return 5;
    } else if (value >= 0.5) {
      return 10;
    } else if (value >= 0.4) {
      return 15;
    } else if (value >= 0.3) {
      return 20;
    } else if (value >= 0.2) {
      return 30;
    } else if (value >= 0.1) {
      return 45;
    } else {
      return 60;
    }
  }

  setAnimationFrameDelay = sliderValue => {
    let frameDelay = this.convertLockedValueToFrameDelay(sliderValue);
    this.setState({frameDelay: frameDelay});
    this.debouncedFrameDelay();
  };

  render() {
    const {allAnimationsSingleFrame, isSelected, isSpriteLab, labType, style} =
      this.props;
    const animationProps = Object.assign(
      {},
      this.getAnimationProps(this.props),
      {frameDelay: this.state.frameDelay}
    );
    const name = this.state.name;
    let animationName;
    if (isSelected) {
      let invalidNameStyle = this.state.isNameValid
        ? {}
        : {backgroundColor: color.lightest_red};
      animationName = (
        <div style={styles.nameInputWrapper}>
          <input
            type="text"
            style={{...styles.nameInput, ...invalidNameStyle}}
            value={name}
            onChange={this.onNameChange}
          />
        </div>
      );
    } else {
      animationName = <div style={styles.nameLabel}>{name}</div>;
    }

    const selectedStyle = isSelected ? styles.selectedTile : {};
    const tileStyle = {...styles.tile, ...selectedStyle, ...style};

    const arrowStyle = isSelected ? styles.rightArrow : {};

    return (
      <button style={tileStyle} onClick={this.onSelect} type="button">
        <div style={arrowStyle} />
        <ListItemThumbnail
          ref="thumbnail"
          animationProps={animationProps}
          isSelected={isSelected}
          singleFrameAnimation={allAnimationsSingleFrame}
        />
        {!isSpriteLab && animationName}
        {isSelected && (
          <ListItemButtons
            onFrameDelayChanged={this.setAnimationFrameDelay}
            onCloneClick={this.cloneAnimation}
            onDeleteClick={this.deleteAnimation}
            onLoopingChanged={this.setAnimationLooping}
            looping={animationProps.looping}
            frameDelay={this.convertFrameDelayToLockedValues(
              this.state.frameDelay
            )}
            singleFrameAnimation={allAnimationsSingleFrame}
            labType={labType}
          />
        )}
      </button>
    );
  }
}

const styles = {
  tile: {
    width: '100%',

    backgroundColor: 'transparent',
    borderRadius: 10,

    // Provide vertical padding because we flow vertically, but require
    // children to use margins horizontally.
    padding: '4px 0px',

    // Allows looping button to display relative to whole card
    position: 'relative',

    border: 0,
    margin: '5px 0 0 0',
  },
  selectedTile: {
    backgroundColor: color.purple,
  },
  nameLabel: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    textAlign: 'center',
    userSelect: 'none',
    overflow: 'hidden',
    fontSize: '13px',
  },
  nameInputWrapper: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 4,
  },
  nameInput: {
    width: '100%',
    margin: 0,
    padding: 0,
    textAlign: 'center',
    border: 'none',
    borderRadius: 9,
  },
  rightArrow: {
    width: 0,
    height: 0,
    borderTop: '10px solid transparent',
    borderBottom: '10px solid transparent',
    borderLeft: '10px solid ' + color.purple,
    position: 'absolute',
    right: '-10px',
    top: 80,
  },
};
export default connect(
  state => ({
    interfaceMode: state.interfaceMode,
    columnWidth: state.animationTab.columnSizes[0],
    allAnimationsSingleFrame:
      state.pageConstants.allAnimationsSingleFrame || false,
    isSpriteLab: state.pageConstants.isBlockly,
  }),
  dispatch => {
    return {
      cloneAnimation(animationKey, type) {
        dispatch(cloneAnimation(animationKey, type));
      },
      deleteAnimation(animationKey, isSpriteLab, type) {
        dispatch(deleteAnimation(animationKey, isSpriteLab, type));
      },
      selectAnimation(animationKey) {
        dispatch(selectAnimation(animationKey));
      },
      selectBackground(animationKey) {
        dispatch(selectBackground(animationKey));
      },
      setAnimationName(animationKey, newName) {
        dispatch(setAnimationName(animationKey, newName));
      },
      setAnimationLooping(animationKey, looping) {
        dispatch(setAnimationLooping(animationKey, looping));
      },
      setAnimationFrameDelay(animationKey, frameDelay) {
        dispatch(setAnimationFrameDelay(animationKey, frameDelay));
      },
    };
  }
)(AnimationListItem);
