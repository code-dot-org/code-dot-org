import PropTypes from 'prop-types';

export const levelShape = PropTypes.shape({
  // id of level
  id: PropTypes.string.isRequired,
  //name of level
  name: PropTypes.string.isRequired,

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
  id: PropTypes.string.isRequired,

  // if only one level the id for that level
  // if multiple variants the level id for the active variant
  activeId: PropTypes.string.isRequired,
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
  duration: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([''])]),
  remarks: PropTypes.bool,
  progressionName: PropTypes.string,
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

export const lessonShape = PropTypes.shape({
  unit: PropTypes.shape({
    lessonGroups: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        userFacing: PropTypes.bool.isRequired,
        lessons: PropTypes.arrayOf(
          PropTypes.shape({
            key: PropTypes.string.isRequired,
            position: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired
          })
        ).isRequired
      })
    ).isRequired
  }).isRequired,
  id: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  purpose: PropTypes.string.isRequired,
  preparation: PropTypes.string.isRequired,
  resources: PropTypes.object,
  vocabularies: PropTypes.arrayOf(PropTypes.object).isRequired,
  programmingExpressions: PropTypes.arrayOf(PropTypes.object).isRequired,
  objectives: PropTypes.arrayOf(PropTypes.object).isRequired,
  assessmentOpportunities: PropTypes.string,
  lessonPlanPdfUrl: PropTypes.string,
  courseVersionStandardsUrl: PropTypes.string
});

export const studentLessonShape = PropTypes.shape({
  unit: PropTypes.shape({
    lessonGroups: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        userFacing: PropTypes.bool.isRequired,
        lessons: PropTypes.arrayOf(
          PropTypes.shape({
            key: PropTypes.string.isRequired,
            position: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired
          })
        ).isRequired
      })
    ).isRequired
  }).isRequired,
  id: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  vocabularies: PropTypes.arrayOf(PropTypes.object).isRequired,
  programmingExpressions: PropTypes.arrayOf(PropTypes.object).isRequired,
  studentLessonPlanPdfUrl: PropTypes.string
});

export const navigationLessonShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  unit: PropTypes.shape({
    lessonGroups: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        userFacing: PropTypes.bool.isRequired,
        lessons: PropTypes.arrayOf(
          PropTypes.shape({
            key: PropTypes.string.isRequired,
            position: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired
          })
        ).isRequired
      })
    ).isRequired
  }).isRequired
});

export const standardShape = PropTypes.shape({
  frameworkName: PropTypes.string.isRequired,
  parentCategoryShortcode: PropTypes.string,
  parentCategoryDescription: PropTypes.string,
  categoryShortcode: PropTypes.string.isRequired,
  categoryDescription: PropTypes.string.isRequired,
  shortcode: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
});
