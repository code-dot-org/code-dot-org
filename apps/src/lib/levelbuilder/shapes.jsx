import PropTypes from 'prop-types';

export const levelShape = PropTypes.shape({
  // id of level
  id: PropTypes.number,
  //name of level
  name: PropTypes.string,
  //url for editing level
  url: PropTypes.string,

  //information used to preview levels in activity preview
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  isConceptLevel: PropTypes.bool,

  // blockly options
  conceptDifficulty: PropTypes.string,
  concepts: PropTypes.string,
  skin: PropTypes.string,
  videoKey: PropTypes.string
});

export const scriptLevelShape = PropTypes.shape({
  // script level id
  id: PropTypes.number.isRequired,

  // The position of this level within the lesson in the UI.
  position: PropTypes.number.isRequired,

  // level id or active variant, or -1 if no level is selected.
  activeId: PropTypes.number,
  // all variants of this level
  levels: PropTypes.arrayOf(levelShape),

  // whether this LevelToken is expanded in the UI.
  expand: PropTypes.bool,

  // information determined at script level
  kind: PropTypes.string,

  // other script level options
  bonus: PropTypes.bool,
  assessment: PropTypes.bool,
  challenge: PropTypes.bool
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
  scriptLevels: PropTypes.arrayOf(scriptLevelShape),
  text: PropTypes.string.isRequired,
  tips: PropTypes.arrayOf(tipShape)
});

export const activityShape = PropTypes.shape({
  key: PropTypes.string,
  displayName: PropTypes.string,
  position: PropTypes.number,
  duration: PropTypes.number,
  activitySections: PropTypes.arrayOf(activitySectionShape)
});

export const resourceShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

export const levelShapeForScript = PropTypes.shape({
  position: PropTypes.number,
  activeId: PropTypes.number,
  ids: PropTypes.arrayOf(PropTypes.number),
  kind: PropTypes.string,
  skin: PropTypes.string,
  videoKey: PropTypes.string,
  concepts: PropTypes.string,
  conceptDifficulty: PropTypes.string,
  progression: PropTypes.bool,
  named: PropTypes.bool,
  bonus: PropTypes.bool,
  assessment: PropTypes.bool,
  challenge: PropTypes.bool
});

export const lessonShape = PropTypes.shape({
  id: PropTypes.number,
  key: PropTypes.string,
  name: PropTypes.string,
  position: PropTypes.number,
  lockable: PropTypes.bool,
  unplugged: PropTypes.bool,
  assessment: PropTypes.bool,
  relativePosition: PropTypes.number,
  levels: PropTypes.arrayOf(levelShapeForScript) // TODO: Update to use scriptLevelShape
});

export const lessonGroupShape = PropTypes.shape({
  key: PropTypes.string,
  displayName: PropTypes.string,
  position: PropTypes.number,
  userFacing: PropTypes.bool,
  bigQuestions: PropTypes.string,
  description: PropTypes.string,
  lessons: PropTypes.arrayOf(lessonShape)
});

export const relatedLessonShape = PropTypes.shape({
  scriptTitle: PropTypes.string.isRequired,
  versionYear: PropTypes.string.isRequired,
  lockable: PropTypes.bool,
  relativePosition: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  editUrl: PropTypes.string.isRequired
});
