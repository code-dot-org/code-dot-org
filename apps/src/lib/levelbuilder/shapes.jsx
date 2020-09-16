import PropTypes from 'prop-types';

export const levelShape = PropTypes.shape({
  //name of level
  name: PropTypes.string,
  //url for editing level
  url: PropTypes.string,

  //information used to preview levels in activity preview
  status: PropTypes.string,
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  levelNumber: PropTypes.number,
  isCurrentLevel: PropTypes.bool,
  isConceptLevel: PropTypes.bool,
  kind: PropTypes.string,

  // The position of this level within the lesson in the UI.
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

export const tipShape = PropTypes.shape({
  key: PropTypes.string,
  type: PropTypes.string,
  markdown: PropTypes.string
});

export const activitySectionShape = PropTypes.shape({
  key: PropTypes.string,
  position: PropTypes.number,
  displayName: PropTypes.string,
  remarks: PropTypes.bool,
  slide: PropTypes.bool,
  levels: PropTypes.arrayOf(levelShape),
  text: PropTypes.string,
  tips: PropTypes.arrayOf(tipShape)
});

export const activityShape = PropTypes.shape({
  key: PropTypes.string,
  displayName: PropTypes.string,
  position: PropTypes.number,
  time: PropTypes.number,
  activitySections: PropTypes.arrayOf(activitySectionShape)
});
