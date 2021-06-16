import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import LessonGroupCard from '@cdo/apps/lib/levelbuilder/unit-editor/LessonGroupCard';
import {
  addGroup,
  convertGroupToUserFacing,
  convertGroupToNonUserFacing
} from '@cdo/apps/lib/levelbuilder/unit-editor/unitEditorRedux';
import ReactDOM from 'react-dom';
import {lessonGroupShape} from '@cdo/apps/lib/levelbuilder/shapes';

class UnitCard extends Component {
  static propTypes = {
    // from redux
    lessonGroups: PropTypes.arrayOf(lessonGroupShape).isRequired,
    addGroup: PropTypes.func.isRequired,
    convertGroupToUserFacing: PropTypes.func.isRequired,
    convertGroupToNonUserFacing: PropTypes.func.isRequired
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

  handleMakeUserFacing = () => {
    const newLessonGroupKey = this.generateLessonGroupKey();
    const newLessonGroupDisplayName = prompt(
      'Enter a display name for first lesson group'
    );
    if (newLessonGroupKey && newLessonGroupDisplayName) {
      this.props.convertGroupToUserFacing(
        1,
        newLessonGroupKey,
        newLessonGroupDisplayName
      );
    }
  };

  handleMakeNonUserFacing = () => {
    this.props.convertGroupToNonUserFacing(1);
  };

  render() {
    const {lessonGroups} = this.props;

    let lessonKeys = [];
    lessonGroups.forEach(lessonGroup => {
      lessonGroup.lessons.forEach(lesson => {
        lessonKeys.push(lesson.key);
      });
    });

    return (
      <div>
        <div style={styles.unitHeader}>Unit</div>
        <div style={styles.unitBody}>
          {lessonGroups.map((lessonGroup, index) => (
            <LessonGroupCard
              key={`lesson-group-${index}`}
              lessonGroupsCount={lessonGroups.length}
              lessonKeys={lessonKeys}
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
            {this.props.lessonGroups[0].userFacing && (
              <button
                onMouseDown={this.handleAddLessonGroup}
                className="btn"
                type="button"
                style={styles.addGroup}
              >
                <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                Add Lesson Group
              </button>
            )}
            {!this.props.lessonGroups[0].userFacing && (
              <button
                onMouseDown={this.handleMakeUserFacing}
                className="btn"
                style={styles.addGroup}
                type="button"
              >
                Enable Lesson Groups
              </button>
            )}
            {this.props.lessonGroups.length === 1 &&
              this.props.lessonGroups[0].userFacing && (
                <button
                  onMouseDown={this.handleMakeNonUserFacing}
                  className="btn"
                  style={styles.addGroup}
                  type="button"
                >
                  Disable Lesson Groups
                </button>
              )}
          </div>
        </div>
      </div>
    );
  }
}

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
    display: 'flex',
    alignItems: 'center'
  },
  displayNameWarning: {
    marginLeft: 5,
    marginTop: 5
  }
};

export const UnconnectedUnitCard = UnitCard;

export default connect(
  state => ({
    lessonGroups: state.lessonGroups
  }),
  {
    addGroup,
    convertGroupToUserFacing,
    convertGroupToNonUserFacing
  }
)(UnitCard);
