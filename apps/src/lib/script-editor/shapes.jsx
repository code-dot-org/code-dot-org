import PropTypes from 'prop-types';

export const levelShape = PropTypes.shape({
  // The position of this level within the stage in the UI.
  position: PropTypes.number.isRequired,

  // level id, or -1 if no level is selected.
  activeId: PropTypes.number.isRequired,
  // level ids for all variants of this level
  ids: PropTypes.arrayOf(PropTypes.number).isRequired,

  // whether this LevelToken is expanded in the UI.
  expand: PropTypes.bool,

  // blockly script level options
  conceptDifficulty: PropTypes.string,
  concepts: PropTypes.string,
  skin: PropTypes.string,
  videoKey: PropTypes.string,

  // other script level options
  named: PropTypes.bool,
  assessment: PropTypes.bool,
  challenge: PropTypes.bool,
  progression: PropTypes.string
});
