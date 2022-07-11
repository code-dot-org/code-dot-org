import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import StatsTable from './StatsTable';
import {
  getStudentsCompletedLevelCount,
  asyncSetCompletedLevelCount
} from './statsRedux';

class StatsTableWithData extends Component {
  static propTypes = {
    // Props provided by redux.
    sectionId: PropTypes.number,
    students: PropTypes.array,
    studentsCompletedLevelCount: PropTypes.object,
    asyncSetCompletedLevelCount: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.asyncSetCompletedLevelCount(this.props.sectionId);
  }

  render() {
    const {sectionId, students, studentsCompletedLevelCount} = this.props;

    return (
      <StatsTable
        sectionId={sectionId}
        students={students}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );
  }
}

export const UnconnectedStatsTableWithData = StatsTableWithData;

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    students: state.teacherSections.selectedStudents,
    studentsCompletedLevelCount: getStudentsCompletedLevelCount(
      state,
      state.teacherSections.selectedSectionId
    )
  }),
  dispatch => ({
    asyncSetCompletedLevelCount(sectionId) {
      dispatch(asyncSetCompletedLevelCount(sectionId));
    }
  })
)(StatsTableWithData);
