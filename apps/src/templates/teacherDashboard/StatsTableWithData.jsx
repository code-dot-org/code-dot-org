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
    section: PropTypes.object,
    studentsCompletedLevelCount: PropTypes.object,
    asyncSetCompletedLevelCount: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.asyncSetCompletedLevelCount(this.props.section.id);
  }

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

export default connect(
  state => ({
    section: state.sectionData.section,
    studentsCompletedLevelCount: getStudentsCompletedLevelCount(
      state,
      state.sectionData.section.id
    )
  }),
  dispatch => ({
    asyncSetCompletedLevelCount(sectionId) {
      dispatch(asyncSetCompletedLevelCount(sectionId));
    }
  })
)(StatsTableWithData);
