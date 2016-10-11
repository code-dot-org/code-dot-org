/** A single list item representing an animation. */
import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import color from '../../color';
import * as PropTypes from '../PropTypes';
import {setAnimationName, cloneAnimation, deleteAnimation,setAnimationFrameDelay, setAnimationLooping,
  isNameUnique} from '../animationListModule';
import {selectAnimation} from './animationTabModule';
import ListItemButtons from './ListItemButtons';
import ListItemThumbnail from './ListItemThumbnail';
import _ from 'lodash';

const styles = {
  tile: {
    width: '100%',

    backgroundColor: 'transparent',
    borderRadius: 10,

    // Provide vertical padding because we flow vertically, but require
    // children to use margins horizontally.
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4,

    // Allows looping button to display relative to whole card
    position: 'relative',

    ':hover': {
      cursor: 'pointer',
      backgroundColor: color.lighter_purple
    }
  },
  selectedTile: {
    backgroundColor: color.purple,

    ':hover': {
      cursor: 'auto',
      backgroundColor: color.purple
    }
  },
  nameLabel: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    textAlign: 'center',
    userSelect: 'none',
    overflow: 'hidden'
  },
  nameInputWrapper: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 4
  },
  nameInput: {
    width: '100%',
    margin: 0,
    padding: 0,
    textAlign: 'center',
    border: 'none',
    borderRadius: 9
  },
  rightArrow: {
    width: 0,
    height: 0,
    borderTop: '10px solid transparent',
    borderBottom: '10px solid transparent',
    borderLeft: '10px solid ' + color.purple,
    position: 'absolute',
    right: '-10px',
    top: 80
  }
};

/**
 * A single list item representing an animation.  Displays an animated
 * thumbnail, along with the animation name and (if currently selected)
 * controls for deleting or duplicating the animation.
 */
const AnimationListItem = React.createClass({
  propTypes: {
    isSelected: React.PropTypes.bool,
    animationKey: PropTypes.AnimationKey.isRequired,
    animationList: PropTypes.AnimationList.isRequired,
    columnWidth: React.PropTypes.number.isRequired,
    cloneAnimation: React.PropTypes.func.isRequired,
    deleteAnimation: React.PropTypes.func.isRequired,
    selectAnimation: React.PropTypes.func.isRequired,
    setAnimationName: React.PropTypes.func.isRequired,
    setAnimationLooping: React.PropTypes.func.isRequired,
    setAnimationFrameDelay: React.PropTypes.func.isRequired,
    children: React.PropTypes.node,
    style: React.PropTypes.object,
    allAnimationsSingleFrame: React.PropTypes.bool.isRequired
  },

  getAnimationProps(props) {
    const {animationList, animationKey} = props;
    return animationList.propsByKey[animationKey];
  },

  getInitialState: function () {
    const {name, frameDelay} = this.getAnimationProps(this.props);
    return {
      frameDelay: frameDelay,
      name: name,
      isNameValid: true
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.columnWidth !== nextProps.columnWidth) {
      this.refs.thumbnail.forceResize();
    }
    this.setState({frameDelay: this.getAnimationProps(nextProps).frameDelay});
    if (this.props.isSelected && !nextProps.isSelected) {
      this.setState({name: this.getAnimationProps(this.props).name, isNameValid: true});
    }
  },

  componentWillMount() {
    this.setState({frameDelay: this.getAnimationProps(this.props).frameDelay});
    this.debouncedFrameDelay = _.debounce(() => {
      const latestFrameDelay = this.state.frameDelay;
      this.props.setAnimationFrameDelay(this.props.animationKey, latestFrameDelay);
    }, 200);
  },

  onSelect() {
    this.props.selectAnimation(this.props.animationKey);
  },

  cloneAnimation(evt) {
    this.props.cloneAnimation(this.props.animationKey);
    evt.stopPropagation();
  },

  deleteAnimation(evt) {
    this.props.deleteAnimation(this.props.animationKey);
    evt.stopPropagation();
  },

  setAnimationLooping(looping) {
    this.props.setAnimationLooping(this.props.animationKey, looping);
  },

  onNameChange(event) {
    const {animationKey, animationList, setAnimationName} = this.props;
    const newName = event.target.value;
    const isNameValid = isNameUnique(newName, animationList.propsByKey);
    this.setState({name: newName, isNameValid: isNameValid});
    if (isNameValid) {
      setAnimationName(animationKey, newName);
    }
  },

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
  },

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
  },

  setAnimationFrameDelay(sliderValue) {
    let frameDelay = this.convertLockedValueToFrameDelay(sliderValue);
    this.setState({frameDelay: frameDelay});
    this.debouncedFrameDelay();
  },

  render() {
    const animationProps = Object.assign({}, this.getAnimationProps(this.props), {frameDelay: this.state.frameDelay});
    const name = this.state.name;
    var animationName;
    if (this.props.isSelected) {
      let invalidNameStyle = this.state.isNameValid ? {} : {backgroundColor: color.lightest_red};
      animationName = (
        <div style={styles.nameInputWrapper}>
          <input
            type="text"
            style={[styles.nameInput, invalidNameStyle]}
            value={name}
            onChange={this.onNameChange}
          />
        </div>
      );
    } else {
      animationName = <div style={styles.nameLabel}>{name}</div>;
    }

    var tileStyle = [
        styles.tile,
        this.props.isSelected && styles.selectedTile,
        this.props.style
    ];

    var arrowStyle = [this.props.isSelected && styles.rightArrow];

    return (
      <div style={tileStyle} onClick={this.onSelect}>
        <div style={arrowStyle}></div>
        <ListItemThumbnail
          ref="thumbnail"
          animationProps={animationProps}
          isSelected={this.props.isSelected}
          singleFrameAnimation={this.props.allAnimationsSingleFrame}
        />
        {animationName}
        {this.props.isSelected &&
          <ListItemButtons
            onFrameDelayChanged={this.setAnimationFrameDelay}
            onCloneClick={this.cloneAnimation}
            onDeleteClick={this.deleteAnimation}
            onLoopingChanged={this.setAnimationLooping}
            looping={animationProps.looping}
            frameDelay={this.convertFrameDelayToLockedValues(this.state.frameDelay)}
            singleFrameAnimation={this.props.allAnimationsSingleFrame}
          />}
      </div>
    );
  }
});
export default connect(state => ({
  columnWidth: state.animationTab.columnSizes[0],
  allAnimationsSingleFrame: state.pageConstants.allAnimationsSingleFrame || false
}), dispatch => {
  return {
    cloneAnimation(animationKey) {
      dispatch(cloneAnimation(animationKey));
    },
    deleteAnimation(animationKey) {
      dispatch(deleteAnimation(animationKey));
    },
    selectAnimation(animationKey) {
      dispatch(selectAnimation(animationKey));
    },
    setAnimationName(animationKey, newName) {
      dispatch(setAnimationName(animationKey, newName));
    },
    setAnimationLooping(animationKey, looping) {
      dispatch(setAnimationLooping(animationKey, looping));
    },
    setAnimationFrameDelay(animationKey, frameDelay) {
      dispatch(setAnimationFrameDelay(animationKey, frameDelay));
    }
  };
})(Radium(AnimationListItem));
