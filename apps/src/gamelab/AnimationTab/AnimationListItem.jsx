/** A single list item representing an animation. */
'use strict';

import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from '../../color';
import * as actions from '../animationModule';
import { METADATA_SHAPE } from '../animationMetadata';
import { selectAnimation } from './animationTabModule';
import ListItemButtons from './ListItemButtons';
import ListItemThumbnail from './ListItemThumbnail';

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
    animation: React.PropTypes.shape(METADATA_SHAPE).isRequired,
    columnWidth: React.PropTypes.number.isRequired,
    cloneAnimation: React.PropTypes.func.isRequired,
    deleteAnimation: React.PropTypes.func.isRequired,
    selectAnimation: React.PropTypes.func.isRequired,
    setAnimationName: React.PropTypes.func.isRequired
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.columnWidth !== nextProps.columnWidth) {
      this.refs.thumbnail.forceResize();
    }
  },

  onSelect() {
    this.props.selectAnimation(this.props.animation.key);
  },

  cloneAnimation() {
    this.props.cloneAnimation(this.props.animation.key);
  },

  deleteAnimation() {
    this.props.deleteAnimation(this.props.animation.key);
  },

  onNameChange(event) {
    this.props.setAnimationName(this.props.animation.key, event.target.value);
  },

  render() {
    var animationName;
    if (this.props.isSelected) {
      animationName = (
        <div style={styles.nameInputWrapper}>
          <input
              type="text"
              style={styles.nameInput}
              value={this.props.animation.name}
              onChange={this.onNameChange} />
        </div>
      );
    } else {
      animationName = <div style={styles.nameLabel}>{this.props.animation.name}</div>;
    }

    var tileStyle = [
        styles.tile,
        this.props.isSelected && styles.selectedTile,
        this.props.style
    ];

    return (
      <div style={tileStyle} onClick={this.onSelect}>
        <ListItemThumbnail
            ref="thumbnail"
            animation={this.props.animation}
            isSelected={this.props.isSelected}
        />
        {animationName}
        {this.props.isSelected && <ListItemButtons
            onCloneClick={this.cloneAnimation}
            onDeleteClick={this.deleteAnimation} />}
      </div>
    );
  }
});
export default connect(state => ({
  columnWidth: state.animationTab.columnSizes[0]
}), dispatch => ({
  cloneAnimation(animationKey) {
    dispatch(actions.cloneAnimation(animationKey));
  },
  deleteAnimation(animationKey) {
    dispatch(actions.deleteAnimation(animationKey));
  },
  selectAnimation(animationKey) {
    dispatch(selectAnimation(animationKey));
  },
  setAnimationName(animationKey, newName) {
    dispatch(actions.setAnimationName(animationKey, newName));
  }
}))(Radium(AnimationListItem));
