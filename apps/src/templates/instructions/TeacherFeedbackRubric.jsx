import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import RubricField from './RubricField';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const rubricLevels = [
  'performanceLevel1',
  'performanceLevel2',
  'performanceLevel3',
  'performanceLevel4'
];

class TeacherFeedbackRubric extends Component {
  static propTypes = {
    rubric: PropTypes.shape({
      keyConcept: PropTypes.string,
      performanceLevel1: PropTypes.string,
      performanceLevel2: PropTypes.string,
      performanceLevel3: PropTypes.string,
      performanceLevel4: PropTypes.string
    }),
    performance: PropTypes.string,
    displayKeyConcept: PropTypes.bool,
    disabledMode: PropTypes.bool.isRequired,
    onRubricChange: PropTypes.func.isRequired,
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired
  };

  render() {
    const {
      rubric,
      performance,
      displayKeyConcept,
      disabledMode,
      onRubricChange,
      viewAs
    } = this.props;

    const showFeedbackInputAreas =
      !displayKeyConcept && !(!performance && viewAs === ViewType.Student);

    // If a student has rubric feedback we want to expand that field
    const expandPerformanceLevelForStudent =
      viewAs === ViewType.Student &&
      showFeedbackInputAreas &&
      performance !== null;

    return (
      <div style={styles.performanceArea}>
        <div style={styles.keyConceptArea}>
          <h1 style={styles.h1}> {i18n.rubricKeyConceptHeader()} </h1>
          <p style={styles.keyConcepts}>{rubric.keyConcept}</p>
        </div>
        <div style={styles.rubricArea}>
          <h1 style={styles.h1}> {i18n.rubricHeader()} </h1>
          <form style={styles.form}>
            {rubricLevels.map(level => (
              <RubricField
                key={level}
                showFeedbackInputAreas={showFeedbackInputAreas}
                expandByDefault={
                  displayKeyConcept ||
                  (expandPerformanceLevelForStudent && performance === level)
                }
                rubricLevel={level}
                rubricValue={rubric[level]}
                disabledMode={disabledMode}
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
