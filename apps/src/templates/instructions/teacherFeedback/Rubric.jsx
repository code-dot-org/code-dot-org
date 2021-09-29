import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import RubricField from '@cdo/apps/templates/instructions/teacherFeedback/RubricField';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {rubricShape} from '@cdo/apps/templates/instructions/teacherFeedback/types';

const rubricLevels = [
  'performanceLevel1',
  'performanceLevel2',
  'performanceLevel3',
  'performanceLevel4'
];

class TeacherFeedbackRubric extends Component {
  static propTypes = {
    rubric: rubricShape,
    performance: PropTypes.string,
    isEditable: PropTypes.bool,
    onRubricChange: PropTypes.func.isRequired,
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired
  };

  render() {
    const {
      rubric,
      performance,
      isEditable,
      onRubricChange,
      viewAs
    } = this.props;

    // RubricFields are used to display and update performance levels. When expanded,
    // the RubricField displays detailed information about the performance level. The RubricFields also
    // have input areas for the teacher to select a performance level or for the student
    // to view the selection.

    let showFeedbackInputAreas, expandAllRubricFields;
    if (viewAs === ViewType.Student) {
      // If the student has not been evaluated by the rubric (!performance),
      // the rubric fields are expanded to display details. If the student has
      // been evaluated the rubric, fields are collapsed by default. Except for the
      // selected performance level (see RubricField implementation below).
      expandAllRubricFields = !performance;

      // Input areas are only displayed if a student has been evalutated with the rubric.
      showFeedbackInputAreas = !!performance;
    } else if (viewAs === ViewType.Teacher) {
      // Rubric fields are all expanded if teacher is viewing but not editing the rubric (this
      // will happen when the teacher is viewing the level and not viewing a student's work).
      // Rubric fields are all collapsed by default if the teacher is evaluating a student.
      expandAllRubricFields = !isEditable;

      showFeedbackInputAreas = isEditable;
    }

    return (
      <div style={styles.performanceArea}>
        <div style={styles.keyConceptArea}>
          <h1 style={styles.h1}>{i18n.rubricKeyConceptHeader()}</h1>
          <p style={styles.keyConcepts}>{rubric.keyConcept}</p>
        </div>
        <div style={styles.rubricArea}>
          <h1 style={styles.h1}> {i18n.rubric()} </h1>
          <form style={styles.form}>
            {rubricLevels.map(level => (
              <RubricField
                key={level}
                showFeedbackInputAreas={showFeedbackInputAreas}
                expandByDefault={
                  expandAllRubricFields ||
                  (viewAs === ViewType.Student && performance === level)
                }
                rubricLevel={level}
                rubricValue={rubric[level]}
                disabledMode={!isEditable}
                onChange={onRubricChange}
                currentlyChecked={performance === level}
              />
            ))}
          </form>
        </div>
      </div>
    );
  }
}

const styles = {
  performanceArea: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 16px 8px 16px'
  },
  keyConceptArea: {
    marginRight: 28,
    flexBasis: '40%'
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  keyConcepts: {
    fontSize: 12,
    color: color.charcoal,
    margin: 0
  },
  rubricArea: {
    flexBasis: '60%'
  },
  form: {
    margin: 0
  }
};

export default TeacherFeedbackRubric;
