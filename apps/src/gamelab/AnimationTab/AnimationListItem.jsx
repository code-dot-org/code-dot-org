/** A single list item representing an animation. */
'use strict';

import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import color from '../../color';
import * as PropTypes from '../PropTypes';
import {setAnimationName, cloneAnimation, deleteAnimation} from '../animationListModule';
import {selectAnimation} from './animationTabModule';
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
    animationKey: PropTypes.AnimationKey.isRequired,
    animationProps: PropTypes.AnimationProps.isRequired,
    columnWidth: React.PropTypes.number.isRequired,
    cloneAnimation: React.PropTypes.func.isRequired,
    deleteAnimation: React.PropTypes.func.isRequired,
    selectAnimation: React.PropTypes.func.isRequired,
    setAnimationName: React.PropTypes.func.isRequired,
    children: React.PropTypes.node,
    style: React.PropTypes.object,
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.columnWidth !== nextProps.columnWidth) {
      this.refs.thumbnail.forceResize();
    }
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

  onNameChange(event) {
    this.props.setAnimationName(this.props.animationKey, event.target.value);
  },

  render() {
    const name = this.props.animationProps.name;
    var animationName;
    if (this.props.isSelected) {
      animationName = (
        <div style={styles.nameInputWrapper}>
          <input
              type="text"
              style={styles.nameInput}
              value={name}
              onChange={this.onNameChange} />
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

    return (
      <div style={tileStyle} onClick={this.onSelect}>
        <ListItemThumbnail
            ref="thumbnail"
            animationProps={this.props.animationProps}
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
  }
}))(Radium(AnimationListItem));
