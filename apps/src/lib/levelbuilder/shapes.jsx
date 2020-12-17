import PropTypes from 'prop-types';

export const levelShape = PropTypes.shape({
  // id of level
  id: PropTypes.number.isRequired,
  //name of level
  name: PropTypes.string.isRequired,
  //url for editing level
  url: PropTypes.string.isRequired,

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

  // if only one level the id for that level
  // if multiple variants the level id for the active variant
  activeId: PropTypes.number.isRequired,
  // all variants of this level
  levels: PropTypes.arrayOf(levelShape).isRequired,

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
  key: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired
});

export const activitySectionShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  position: PropTypes.number.isRequired,
  displayName: PropTypes.string.isRequired,
  remarks: PropTypes.bool,
  scriptLevels: PropTypes.arrayOf(scriptLevelShape).isRequired,
  text: PropTypes.string.isRequired,
  tips: PropTypes.arrayOf(tipShape).isRequired
});

export const activityShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  position: PropTypes.number.isRequired,
  duration: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([''])])
    .isRequired,
  activitySections: PropTypes.arrayOf(activitySectionShape)
});

export const resourceShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  type: PropTypes.string,
  audience: PropTypes.string,
  assessment: PropTypes.bool,
  includeInPdf: PropTypes.bool,
  downloadUrl: PropTypes.string
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
  key: PropTypes.string.isRequired,
  name: PropTypes.string,
  position: PropTypes.number.isRequired,
  lockable: PropTypes.bool,
  unplugged: PropTypes.bool,
  assessment: PropTypes.bool,
  relativePosition: PropTypes.number,
  levels: PropTypes.arrayOf(levelShapeForScript).isRequired // TODO: Update to use scriptLevelShape
});

export const lessonGroupShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  position: PropTypes.number.isRequired,
  userFacing: PropTypes.bool.isRequired,
  bigQuestions: PropTypes.string,
  description: PropTypes.string,
  lessons: PropTypes.arrayOf(lessonShape).isRequired
});

export const relatedLessonShape = PropTypes.shape({
  scriptTitle: PropTypes.string.isRequired,
  versionYear: PropTypes.string.isRequired,
  lockable: PropTypes.bool,
  relativePosition: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  editUrl: PropTypes.string.isRequired
});
