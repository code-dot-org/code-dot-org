import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import StatsTable from './StatsTable';
import {getStudentsCompletedLevelCount} from './statsRedux';

class StatsTableWithData extends Component {
  static propTypes = {
    // Props provided by redux.
    section: PropTypes.object,
    studentsCompletedLevelCount: PropTypes.object,
  };

  render() {
    const {section, studentsCompletedLevelCount} = this.props;

    return (
      <StatsTable
        section={section}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );
  }
}

export const UnconnectedStatsTableWithData = StatsTableWithData;

export default connect(state => ({
  section: state.sectionData.section,
  studentsCompletedLevelCount: getStudentsCompletedLevelCount(state, state.sectionData.section.id),
}))(StatsTableWithData);
