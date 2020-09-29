import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import LessonGroupCard from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupCard';
import {addGroup} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';

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

class UnitCard extends Component {
  static propTypes = {
    // from redux
    lessonGroups: PropTypes.array.isRequired,
    addGroup: PropTypes.func.isRequired
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
          {lessonGroups.map((lessonGroup, index) => {
            return (
              <LessonGroupCard
                key={`lesson-group-${index}`}
                lessonGroupssCount={lessonGroups.length}
                lessonGroup={lessonGroup}
              />
            );
          })}
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
              You must set the display name of the existing lesson group before
              adding more.
            </span>
          )}
        </div>
      </div>
    );
  }
}

export const UnconnectedLessonGroupCard = UnitCard;

export default connect(
  state => ({
    lessonGroups: state.lessonGroups
  }),
  {
    addGroup
  }
)(UnitCard);
