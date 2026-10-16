const FacingDirection = Object.freeze({
  North: 0,
  East: 1,
  South: 2,
  West: 3,

  opposite: function (facing) {
    switch (facing) {
      case FacingDirection.North: return FacingDirection.South;
      case FacingDirection.South: return FacingDirection.North;
      case FacingDirection.East: return FacingDirection.West;
      case FacingDirection.West: return FacingDirection.East;
    }
  },

  left: function (facing) {
    return this.turn(facing, 'left');
  },

  right: function (facing) {
    return this.turn(facing, 'right');
  },

  turnDirection: function (from, to) {
    switch (from) {
      case FacingDirection.North: return to === FacingDirection.East ? 'right' : 'left';
      case FacingDirection.South: return to === FacingDirection.West ? 'right' : 'left';
      case FacingDirection.East: return to === FacingDirection.South ? 'right' : 'left';
      case FacingDirection.West: return to === FacingDirection.North ? 'right' : 'left';
    }
  },

  turn: function (facing, rotation) {
    return (facing + 4 + (rotation === 'right' ? 1 : -1)) % 4;
  },

  directionToOffset: function (direction) {
    switch (direction) {
      case FacingDirection.North: return [0, -1];
      case FacingDirection.South: return [0, 1];
      case FacingDirection.East: return [1, 0];
      case FacingDirection.West: return [-1, 0];
    }
  },

  directionToRelative(direction) {
    switch (direction) {
      case FacingDirection.North: return "Up";
      case FacingDirection.South: return "Down";
      case FacingDirection.East: return "Right";
      case FacingDirection.West: return "Left";
    }
  }

});

module.exports = FacingDirection;
