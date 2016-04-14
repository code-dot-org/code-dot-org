/** A single list item representing an animation sequence. */
'use strict';

var _ = require('../../lodash');
var actions = require('../actions');
var animationTabActions = require('./actions');
var color = require('../../color');
var connect = require('react-redux').connect;
var ListItemButtons = require('./ListItemButtons');
var ListItemThumbnail = require('./ListItemThumbnail');

var staticStyles = {
  tile: {
    width: '100%',

    borderRadius: 10,

    // Provide vertical padding because we flow vertically, but require
    // children to use margins horizontally.
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4
  },
  nameLabel: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    textAlign: 'center',
    userSelect: 'none'
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
 * A single list item representing an animation sequence.  Displays an
 * animated thumbnail of the sequence, along with the sequence name and
 * (if currently selected) controls for deleting or duplicating the sequence.
 */
var AnimationSequenceListItem = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isSelected: React.PropTypes.bool,
    animation: React.PropTypes.object.isRequired,
    deleteAnimation: React.PropTypes.func.isRequired,
    selectAnimation: React.PropTypes.func.isRequired,
    setAnimationName: React.PropTypes.func.isRequired
  },
  
  onSelect: function () {
    this.props.selectAnimation(this.props.animation.key);
  },
  
  deleteAnimation: function () {
    this.props.deleteAnimation(this.props.animation.key);
  },

  onNameChange: function (event) {
    this.props.setAnimationName(this.props.animation.key, event.target.value);
  },

  render: function () {
    var styles = _.merge({}, staticStyles, {
      tile: {
        backgroundColor: this.props.isSelected ? color.purple : 'transparent'
      }
    }, {
      tile: this.props.style
    });

    var sequenceName;
    if (this.props.isSelected) {
      sequenceName = (
        <div style={styles.nameInputWrapper}>
          <input
              type="text" 
              style={styles.nameInput}
              value={this.props.animation.name}
              onChange={this.onNameChange} />
        </div>
      );
    } else {
      sequenceName = <div style={styles.nameLabel}>{this.props.animation.name}</div>;
    }


    return (
      <div style={styles.tile} onClick={this.onSelect}>
        <ListItemThumbnail
            isSelected={this.props.isSelected}
            src={this.props.assetUrl('media/common_images/draw-east.png')} />
        {sequenceName}
        {this.props.isSelected && <ListItemButtons onDeleteClick={this.deleteAnimation} />}
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
}, function propsFromDispatch(dispatch) {
  return {
    deleteAnimation: function (animationKey) {
      dispatch(actions.deleteAnimation(animationKey));
    },
    selectAnimation: function (animationKey) {
      dispatch(animationTabActions.selectAnimation(animationKey));
    },
    setAnimationName: function (animationKey, newName) {
      dispatch(actions.setAnimationName(animationKey, newName));
    }
  }
})(AnimationSequenceListItem);
