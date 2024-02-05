import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import RubricField from '@cdo/apps/templates/instructions/teacherFeedback/RubricField';
import {rubricShape} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import fontConstants from '@cdo/apps/fontConstants';

const rubricLevels = [
  'performanceLevel1',
  'performanceLevel2',
  'performanceLevel3',
  'performanceLevel4',
];

class TeacherFeedbackRubric extends Component {
  static propTypes = {
    rubric: rubricShape,
    performance: PropTypes.string,
    isEditable: PropTypes.bool,
    onRubricChange: PropTypes.func,
  };

  render() {
    const {rubric, performance, isEditable, onRubricChange} = this.props;

    // RubricFields are used to display and update performance levels. When expanded,
    // the RubricField displays detailed information about the performance level. The RubricFields also
    // have input areas for the teacher to select a performance level or for the participant
    // to view the selection.

    // If the user has not been evaluated by the rubric (!performance) and is not
    // evaluating (!isEditable), the rubric fields are all expanded to display details.
    const expandAllRubricFields = !isEditable && !performance;

    const showFeedbackInputAreas = isEditable || !!performance;

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
                expandByDefault={expandAllRubricFields || performance === level}
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
    margin: '0px 16px 8px 16px',
  },
  keyConceptArea: {
    marginRight: 28,
    flexBasis: '40%',
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    ...fontConstants['main-font-semi-bold'],
  },
  keyConcepts: {
    fontSize: 12,
    color: color.charcoal,
    margin: 0,
  },
  rubricArea: {
    flexBasis: '60%',
  },
  form: {
    margin: 0,
  },
};

export default TeacherFeedbackRubric;
