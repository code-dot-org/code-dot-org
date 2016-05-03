/** A single list item representing an animation. */
'use strict';

var _ = require('../../lodash');
var actions = require('../actions');
var animationsApi = require('../../clientApi').animations;
var color = require('../../color');
var connect = require('react-redux').connect;
var ListItemButtons = require('./ListItemButtons');
var ListItemThumbnail = require('./ListItemThumbnail');
var Radium = require('radium');
var selectAnimation = require('./animationTabModule').selectAnimation;

var styles = {
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
var AnimationListItem = React.createClass({
  propTypes: {
    isSelected: React.PropTypes.bool,
    animation: React.PropTypes.object.isRequired,
    cloneAnimation: React.PropTypes.func.isRequired,
    deleteAnimation: React.PropTypes.func.isRequired,
    selectAnimation: React.PropTypes.func.isRequired,
    setAnimationName: React.PropTypes.func.isRequired
  },

  onSelect: function () {
    this.props.selectAnimation(this.props.animation.key);
  },

  cloneAnimation: function () {
    this.props.cloneAnimation(this.props.animation.key);
  },

  deleteAnimation: function () {
    this.props.deleteAnimation(this.props.animation.key);
  },

  onNameChange: function (event) {
    this.props.setAnimationName(this.props.animation.key, event.target.value);
  },

  render: function () {
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
            isSelected={this.props.isSelected}
            src={animationsApi.basePath(this.props.animation.key + '.png')} />
        {animationName}
        {this.props.isSelected && <ListItemButtons
            onCloneClick={this.cloneAnimation}
            onDeleteClick={this.deleteAnimation} />}
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {};
}, function propsFromDispatch(dispatch) {
  return {
    cloneAnimation: function (animationKey) {
      dispatch(actions.cloneAnimation(animationKey));
    },
    deleteAnimation: function (animationKey) {
      dispatch(actions.deleteAnimation(animationKey));
    },
    selectAnimation: function (animationKey) {
      dispatch(selectAnimation(animationKey));
    },
    setAnimationName: function (animationKey, newName) {
      dispatch(actions.setAnimationName(animationKey, newName));
    }
  };
})(Radium(AnimationListItem));
