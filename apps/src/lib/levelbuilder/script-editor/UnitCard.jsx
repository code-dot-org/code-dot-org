import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import LessonGroupCard from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupCard';
import {addGroup} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import ReactDOM from 'react-dom';
import {lessonGroupShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  unitHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10
  },
  unitBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20
  },
  addLesson: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  },
  addGroupWithWarning: {
    margin: '0 0 30px 0',
    display: 'flex',
    alignItems: 'center'
  },
  displayNameWarning: {
    marginLeft: 5,
    marginTop: 5
  }
};

// Replace ' with \'
const escape = str => str.replace(/'/, "\\'");

class UnitCard extends Component {
  static propTypes = {
    // from redux
    lessonGroups: PropTypes.arrayOf(lessonGroupShape).isRequired,
    addGroup: PropTypes.func.isRequired,
    levelKeyList: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      targetLessonGroupPos: null
    };
  }

  setTargetLessonGroup = targetLessonGroupPos => {
    this.setState({targetLessonGroupPos});
  };

  // To be populated with the bounding client rect of each LessonGroupCard element.
  lessonGroupMetrics = {};

  setLessonGroupMetrics = (metrics, lessonGroupPosition) => {
    this.lessonGroupMetrics[lessonGroupPosition] = metrics;
  };

  serializeLessonGroups = lessonGroups => {
    let s = [];
    lessonGroups.forEach(lessonGroup => {
      if (lessonGroup.user_facing && lessonGroup.lessons.length > 0) {
        let t = `lesson_group '${lessonGroup.key}'`;
        t += `, display_name: '${escape(lessonGroup.display_name)}'`;
        if (lessonGroup.description) {
          t += `, lesson_group_description: '${escape(
            lessonGroup.description
          )}'`;
        }
        if (lessonGroup.big_questions) {
          lessonGroup.big_questions.forEach(question => {
            t += `, lesson_group_question: '${escape(question)}'`;
          });
        }
        s.push(t);
      }
      lessonGroup.lessons.forEach(lesson => {
        s = s.concat(this.serializeLesson(lesson));
      });
    });

    s.push('');
    return s.join('\n');
  };

  /**
   * Generate the ScriptDSL format.
   * @param lesson
   * @return {string}
   */
  serializeLesson = lesson => {
    let s = [];
    let t = `lesson '${escape(lesson.name)}'`;
    if (lesson.name) {
      t += `, display_name: '${escape(lesson.name)}'`;
    }
    if (lesson.lockable) {
      t += ', lockable: true';
    }
    if (lesson.visible_after) {
      t += ', visible_after: true';
    }
    s.push(t);
    lesson.levels.forEach(level => {
      s = s.concat(this.serializeLevel(level.ids[0], level));
    });
    s.push('');
    return s.join('\n');
  };

  serializeLevel = (id, level, active) => {
    const s = [];
    const key = this.props.levelKeyList[id];
    if (/^blockly:/.test(key)) {
      if (level.skin) {
        s.push(`skin '${escape(level.skin)}'`);
      }
      if (level.videoKey) {
        s.push(`video_key_for_next_level '${escape(level.videoKey)}'`);
      }
      if (level.concepts) {
        // concepts is a comma-separated list of single-quoted strings, so do
        // not escape its single quotes.
        s.push(`concepts ${level.concepts}`);
      }
      if (level.conceptDifficulty) {
        s.push(`level_concept_difficulty '${escape(level.conceptDifficulty)}'`);
      }
    }
    let l = `level '${escape(key)}'`;
    if (active === false) {
      l += ', active: false';
    }
    if (level.progression) {
      l += `, progression: '${escape(level.progression)}'`;
    }
    if (level.named) {
      l += `, named: true`;
    }
    if (level.assessment) {
      l += `, assessment: true`;
    }
    if (level.challenge) {
      l += `, challenge: true`;
    }
    s.push(l);
    return s;
  };

  generateLessonGroupKey = () => {
    let lessonGroupNumber = this.props.lessonGroups.length + 1;
    while (
      this.props.lessonGroups.some(
        lessonGroup => lessonGroup.key === `lessonGroup-${lessonGroupNumber}`
      )
    ) {
      lessonGroupNumber++;
    }

    return `lessonGroup-${lessonGroupNumber}`;
  };

  handleAddLessonGroup = () => {
    const newLessonGroupName = prompt('Enter new lesson group name');
    this.props.addGroup(
      this.props.lessonGroups.length + 1,
      this.generateLessonGroupKey(),
      newLessonGroupName
    );
  };

  render() {
    const {lessonGroups} = this.props;

    return (
      <div>
        <div style={styles.unitHeader}>Unit</div>
        <div style={styles.unitBody}>
          {lessonGroups.map((lessonGroup, index) => (
            <LessonGroupCard
              key={`lesson-group-${index}`}
              lessonGroupsCount={lessonGroups.length}
              lessonGroup={lessonGroup}
              ref={lessonGroupCard => {
                if (lessonGroupCard) {
                  const metrics = ReactDOM.findDOMNode(
                    lessonGroupCard
                  ).getBoundingClientRect();
                  this.setLessonGroupMetrics(metrics, lessonGroup.position);
                }
              }}
              lessonGroupMetrics={this.lessonGroupMetrics}
              setTargetLessonGroup={this.setTargetLessonGroup}
              targetLessonGroupPos={this.state.targetLessonGroupPos}
              generateLessonGroupKey={this.generateLessonGroupKey}
            />
          ))}
          <div style={styles.addGroupWithWarning}>
            <button
              onMouseDown={this.handleAddLessonGroup}
              className="btn"
              style={styles.addGroup}
              type="button"
              disabled={!this.props.lessonGroups[0].user_facing}
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Add Lesson Group
            </button>
          </div>
          {!this.props.lessonGroups[0].user_facing && (
            <span style={styles.displayNameWarning}>
              You must make the existing lesson group user facing before adding
              more.
            </span>
          )}
        </div>
        <input
          type="hidden"
          name="script_text"
          value={this.serializeLessonGroups(lessonGroups)}
        />
      </div>
    );
  }
}

export const UnconnectedUnitCard = UnitCard;

export default connect(
  state => ({
    lessonGroups: state.lessonGroups,
    levelKeyList: state.levelKeyList
  }),
  {
    addGroup
  }
)(UnitCard);
